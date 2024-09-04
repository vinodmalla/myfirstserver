# butterfly README

**assignment 1a** 
Create a responsive web page which shows the ecommerce/college/exam admin dashboard with sidebar and statistics in cards using HTML, CSS and Bootstrap.

Keyword : ^butterfly1a

How to code : just create an html file and use keyword

How to run : Golive

**assignment 1b** 
Write a JavaScript Program to get the user registration data and push to array/local storage with AJAX POST method and data list in new page.

Keyword : ^butterfly1b, ^butterfly1bform, ^butterfly1bscript

How to code : 
create 2 html files display.html, form.html
create 2 javascript files display.js, script.js
use keywords-
display.html  --> ^butterfly1b
display.js    --> ^butterfly1b
form.html     --> ^butterfly1bform
script.js     --> ^butterfly1bscript

How to run : Golive on form.html

**assignment 2a** 
Create version control account on GitHub and using Git commands to create repository and push your code to GitHub.

How to perform : 
    create a repo on github
    create a folder in ur machine and open it in git bash
    use `git config --global user.name "kimi no nawa"` and `git config --global user.mail "urmail"` 
    use `git init`
    make changes or create some files 
    use `git add --all`
    use `git commit -m "write ur msg here"`
    use `git status` for status
    and `git log` for history
    add local repo to remote repo using `git remote add origin <repo link>`
    use `git push -u origin` to pusch ur changes
    u can use `git help --all` to get all command

**assignment 2b** 
Create Docker Container Environment (NVIDEIA Docker or any other).

Keyword : ^butterfly2b

How to code : 
    create a simple hello world program
    create Dockerfile --> ^butterfly2b


How to run : 
    Write command on terminal, `docker build –t <flodername> .`
    Run docker using docker run xyz command.

**assignment 2c** 
Create an Angular application which will do following actions: Register User, Login User, Show User Data on Profile Component

How to code : 
    create angular project by `ng new projectname`
    now go inside ur project folder using `cd projectname`
    create folder named `components` inside src inside app 
    generate 4 components
        `ng g c home`<br>
        `ng g c login`<br>
        `ng g c profile`<br>
        `ng g c register`<br>
    create folder named `services` inside src inside app <br>
    generate a service
        `ng g s auth`<br>

    now delete the previous and use keywords to generate codes of following files
        app.module.ts --> ^butterfly2cAppModule
<br>
        app.component.html --> ^butterfly2cAppComp
<br>
        app.routing.ts --> ^butterfly2cAppRouting
<br>
        auth.service.ts --> ^butterfly2cAuthService
<br>
        home.component.html --> ^butterfly2chome
<br>
        home.component.ts --> ^butterfly2chome
<br>        
        register.component.html --> ^butterfly2cregister
<br>        
        register.component.ts --> ^butterfly2cregister
<br>
        login.component.html --> ^butterfly2clogin
<br>
        login.component.ts --> ^butterfly2clogin
<br>
        profile.component.html --> ^butterfly2cprofile
<br>
        profile.component.ts --> ^butterfly2cprofile

How to run : `ng serve` on cmd

**assignment 3a** 
Create a Node.JS Application which serves a static website.

Keyword : ^butterfly3a

How to code :
create a folder run go inide that folder and run`node init` <br>te
create serve.js --> ^butterfly3a
create a folder insided fisrtone named public
inside public create a file display.html --> ^butterfly3a

How to run : node serve.js then  go to localhost:8000 and then localhost:8000/display.html

**Assignment 3b**

*Pre-requisites*: **`Node`**, **`MongoDB Compass`**, **`Postman`**, **`Internet Connection`**

step 1: Create project folder and initialize Node: `npm init` in a project folder using **cmd prompt**.
<br>

step 2: Install express, mongoose `npm install express` and `npm install mongoose` on terminal.
<br>

wait.......
<br>

step 3: Create folder **models** and file [`app.js`] using `^butterfly3bapp` inside the project folder.
<br>

step 4: Inside folder **models** create file [`model.js`] using `^butterfly3bmodel`.
<br>

step 5: Run the code [`app.js`] using cmd `node app.js`.
<br>

step 6: Open MongoDB Compass and create new connection and connect it. We see our database `db1` and collction `books` inside compass.
<br>

step 7: Open [`http://localhost:3000/books`]() in browser.
<br>

step 8: Open Postman and create new collection and add a request.
<br>

**Note**: While sending requests also check the changes in mongoDBCompass

<br>

> a) Switch to POST request and paste url: `http://localhost:3000/books` then open Body -> raw -> JSON and add JSON object {"book": "harry", "author": "potter"} and send.
<br>

> b) Switch to GET and url: `http://localhost:3000/books` send requst to get all documents.
<br>

> c) Switch to GET and url: `http://localhost:3000/books/mongo_object_id` and send request to get specific document.
<br>

> d) Switch to PUT and url: `http://localhost:3000/books/mongo_object_id` then open Body -> raw -> JSON and add updated JSON object {"book": "Harry Potter", "author": "JK Rowling"} and send request to update the specific document using object id. 
<br>

> e) Switch to DELETE and url: `http://localhost:3000/books/mongo_object_id` and send request to delete specific document.
<br>

**assignment 4a** 
Create a simple Mobile Website using jQuery Mobile.

How to code: create a file index.html --> ^butterfly4a

How to run: golive 

**cc1**
create 2 files main.py and app.yaml
main.py--> ^butterfly1cc
for app.yaml paste this code

runtime: python27
threadsafe: true

handlers:
- url: /
  script: main.app


How to run: py "path of devapp_serve.py" "path of ur folder"

**cc2**
create 4 files main.py, app.yaml, index.html and error.html
main.py--> ^butterfly2cc
index.html--> ^butterfly2ccindex
error.html--> ^butterfly2ccerror
results.html--> ^butterfly2ccresult
for app.yaml paste this code

runtime: python27
threadsafe: true

handlers:
- url: /
  script: main.app


How to run: py "path of devapp_serve.py" "path of ur folder"

## Features
 Saves ur ass

## Requirements
 u must be close friend of a stupid guy who can waste hrs to code this insted of studying

## Extension Settings
 just install and ur ready to go

## Known Issues
not any

## Release Notes
the poor developer worked really hard on this he would really appriciate a cadboury dairymilk silk 

Happy hacking!!!


### 1.0.0

Initial release of abandoned butterfly


