const request = require('request');
const cheerio = require('cheerio');
const { Promise, resolve } = require('bluebird');
const fs = require('fs');

const url = "https://www.cermati.com/artikel"
const jsonFileName = 'solution.json'

class Article {
    constructor(URL, Title, Author, PostingDate, RelatedArticles) {
        this.URL = URL
        this.Title = Title
        this.Author = Author
        this.PostingDate = PostingDate
        this.RelatedArticles = RelatedArticles
    }
}

Scrapping(url)
    .then((articleLinkList) => {
        formattingArticle(articleLinkList)
    })

function Scrapping(url) {
    return new Promise((resolve, reject) => {
        return request(url, (error, response, html) => {
            if (!error && response.statusCode === 200) {
                var html = cheerio.load(html)
                var articleLinkList = []
                html('.article-list-item a').each((i, el) => {
                    const item = html(el).attr('href')
                    articleLinkList.push('https://www.cermati.com' + item)
                })
                resolve(articleLinkList)
            }
            else {
                reject(error)
            }
        })
    })
}

function formattingArticle(articleLinkList) {
    var articleList = []
    var p = new Promise(() => {
        return articleLinkList.forEach(link => {
            return request(link, (error, response, html) => {
                if (!error && response.statusCode === 200) {
                    var html = cheerio.load(html)
                    var title = html('.post-title').text().trim()
                    var author = html('.author-name').text().trim()
                    var postingDate = html('.post-date').text().trim()
                    var relatedArticle = []
                    html('.panel-items-list').first().children().each((i, element) => {
                        var linkArticleTerkait = 'https://www.cermati.com' + html(element).find('a').attr('href')
                        var titleArticleTerkait = html(element).find('h5').text()
                        relatedArticle.push({
                            "url": linkArticleTerkait,
                            "title": titleArticleTerkait
                        })
                    })
                    articleList.push(new Article(link, title, author, postingDate, relatedArticle))
                }
                var createJson = new Promise(() => {
                    var jsonFormat = '{ \n\"articles\": ' + JSON.stringify(articleList, null, 2) + '\n}'
                    fs.writeFileSync(jsonFileName, jsonFormat)
                })
            })
        })
    })
}

