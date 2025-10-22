const express=require("express");
const fs=require("fs");
const path=require("path");
const app=express();
const PORT=3000;
const BOOKS_FILE=path.join(__dirname,"books.json");
app.use(express.json());
function readBooksFile(){
  try{
    const data=fs.readFileSync(BOOKS_FILE,"utf8");
    return JSON.parse(data);
  }catch(err){
    return[];
  }
}
function writeBooksFile(books){
  fs.writeFileSync(BOOKS_FILE,JSON.stringify(books,null,2));
}
app.get("/books",(req,res)=>{
  res.json(readBooksFile());
});
app.get("/books/available",(req,res)=>{
  res.json(readBooksFile().filter(book=>book.available));
});
app.post("/books",(req,res)=>{
  const{title,author,available}=req.body;
  if(!title||!author||typeof available!=="boolean") return res.status(400).json({error:"Invalid book data"});
  const books=readBooksFile();
  const newId=books.length>0?Math.max(...books.map(b=>b.id))+1:1;
  const newBook={id:newId,title,author,available};
  books.push(newBook);
  writeBooksFile(books);
  res.status(201).json(newBook);
});
app.put("/books/:id",(req,res)=>{
  const bookId=parseInt(req.params.id);
  const{title,author,available}=req.body;
  const books=readBooksFile();
  const bookIndex=books.findIndex(b=>b.id===bookId);
  if(bookIndex===-1) return res.status(404).json({error:"Book not found"});
  if(title!==undefined) books[bookIndex].title=title;
  if(author!==undefined) books[bookIndex].author=author;
  if(available!==undefined) books[bookIndex].available=available;
  writeBooksFile(books);
  res.json(books[bookIndex]);
});
app.delete("/books/:id",(req,res)=>{
  const bookId=parseInt(req.params.id);
  const books=readBooksFile();
  const newBooks=books.filter(b=>b.id!==bookId);
  if(books.length===newBooks.length) return res.status(404).json({error:"Book not found"});
  writeBooksFile(newBooks);
  res.json({message:"Book deleted successfully"});
});
app.listen(PORT,()=>{console.log(`Server running at http://localhost:${PORT}`)});
