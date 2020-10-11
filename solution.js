/** web scraper for cermati article
 * made by: M. Rizky Widyayulianto
 */

const rp = require('request-promise')
const cheerio = require('cheerio')
var fs = require('fs')

const url = 'https://www.cermati.com/artikel'
const cermati = 'https://www.cermati.com'

var list = []
var listArticles = []
var listNewestArticles = []
var listPopularArticles = []

rp(url)
.then(function(html){
    // load all the article link
    var $ = cheerio.load(html)
    $('div.article-list-item').map((i, element) => {
        var link = $(element).find('a').attr('href')
        
        // add https
        link = cermati.concat(link)
        
        list.push(link)
    })

    $('h4:contains("Artikel Terbaru")').next().find('li').map((i, newArt) => {
        var backlink = $(newArt).find('a').attr('href')
        var fulllink = cermati.concat(backlink)
        var titleArticle = $(newArt).find('h5').text().trim()
        var newArtCategory = $(newArt).find('span.item-category').text().trim()
        var newArtDate = $(newArt).find('span.item-publish-date').text().trim()
        var newestArticle = {
            "url": fulllink,
            "title": titleArticle,
            "category": newArtCategory,
            "date": newArtDate.replace('•\n                      ',''),
        }
        listNewestArticles.push(newestArticle)
    })

    $('h4:contains("Artikel Populer")').next().find('li').map((i, popArt) => {
        var backlink = $(popArt).find('a').attr('href')
        var fulllink = cermati.concat(backlink)
        var titleArticle = $(popArt).find('h5').text().trim()
        var popArtViewed = $(popArt).find('span.item-view-counter').text().trim()
        var popularArticle = {
            "url": fulllink,
            "title": titleArticle,
            "viewed": popArtViewed.split(' ')[1] + ' times',
        }
        listPopularArticles.push(popularArticle)
    })
    
    // get all detail for each article
    list.forEach(function(element, i){
        rp(element)
        .then(function(linkArticles){
            var $ = cheerio.load(linkArticles)
            
            // article title
            var title = $('h1.post-title').text().trim()
            
            // article author
            var author = $('span.author-name').text().trim()
            
            // article category
            var category = $('div.post-category>a').text().trim()
            
            // article posting date
            var date = $('span.post-date').find('span').text().trim()
            
            
            // related articles
            var relatedArticles = []
            $('h4:contains("Artikel Terkait")').next().find('li').map((i, relArt) => {
                var backlink = $(relArt).find('a').attr('href')
                var fulllink = cermati.concat(backlink)
                var titleArticle = $(relArt).find('h5').text().trim()
                var relArtCategory = $(relArt).find('span.item-category').text().trim()
                var relArtDate = $(relArt).find('span.item-publish-date').text().trim()
                var relatedArticle = {
                    "url": fulllink,
                    "title": titleArticle,
                    "category": relArtCategory,
                    "date": relArtDate.replace('•\n                      ',''),
                }
                relatedArticles.push(relatedArticle)
            })
            
            // make JSON Object
            var article = {
                "url": element,
                "title": title,
                "author": author,
                "category": category,
                "postingDate": date,
                "relatedArticles": relatedArticles
            }
            
            listArticles.push(article)

        })
        .catch(function(error) {
            console.log(error)
        })
        .finally(function() {
            // check if it's on last article
            if (i === list.length - 1){
                var articles = {
                    "articles": {
                        "main": listArticles,
                        "newest": listNewestArticles,
                        "popular": listPopularArticles,
                    },
                }
                var jsonArticle = JSON.stringify(articles);
                fs.writeFileSync("solution.json", jsonArticle)
            }
        })
    })
})
.catch(function(error){
    console.log(error)
})