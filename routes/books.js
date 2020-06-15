const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const fs = require('fs')
const multer = require('multer')
const path = require('path')

const uploadPath = path.join('public' , Book.coverImageBasePath)
const imageMineTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest : uploadPath,
    fileFilter : (req,file,callback) => {
        callback(null,imageMineTypes.includes(file.mimetype))
    }
})

// All Books Route
router.get('/', async (req,res) => {
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title' , new RegExp(req.query.title , 'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate' , req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate' , req.query.publishedAfter)
    }

    try {
        const books = await query.exec()
        res.render('books/index' , {
            books : books,
            searchOptions : req.query
        })
    } catch (error) {
        res.redirect('/')
    }
})

// New Book Route
router.get('/new',async (req,res) => {
    renderMessage(res, new Book())
})

// create Book Route
router.post('/',upload.single('cover') ,async (req,res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title : req.body.title,
        description : req.body.description,
        publishDate : new Date(req.body.publishDate),
        pageCount : req.body.pageCount,
        author : req.body.author,
        coverImageName : fileName
    })

    try { 
        const newBook = await book.save()
        //res.redirect(`/books/${newBook.id}`)
        res.redirect('books')
    } catch (error) {
        if(book.coverImageName != null){
            removeCoverBook(book.coverImageName)
        }
        renderMessage(res, book, true)
    }
})

function removeCoverBook(fileName){
    fs.unlink(path.join(uploadPath,fileName), err  =>  {
        if(err) console.error(err)
    })
}

async function renderMessage(res, book, hasError = false){
    try {
        const authors = await Author.find({})

        const params = {
            authors : authors,
            book : book
        }
        if(hasError) params.errorMessage = 'Error When Creating Book'

        res.render('books/new', params)
    } catch (error) {
        res.redirect('/books')
    }
}

module.exports = router