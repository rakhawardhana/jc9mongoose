var express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const sharp = require('sharp')
const cors = require('cors')
const bcrypt = require('bcrypt')


const User = require('./models/user.js')
const Task = require('./models/task')

//"mongodb+srv://rakha96bro:Mysql123@rakhacluster-dkzqi.mongodb.net/rakha96?retryWrites=true&w=majority"

mongoose.connect(
'mongodb://127.0.0.1:27017/jc-mongoose', {
    useNewUrlParser: true, 
    // ensureIndex(), usang
    // createIndex(), baru
    useCreateIndex: true
})


const app = express()
const port = 2019


app.use(cors())
app.use(express.json())

//ROUTE
//menentukan model
// const User = mongoose.model('User', {
//     name: String,
//     age: Number 
// })

//membuat model 
// const person = new User({name: 'Titan', age: 99})

// //save untuk simpan/ insert user ke database
// person.save().then(() => {console.log('Berhasil input user')})


app.get('/', (req, res) => {
    res.send("<h1>API Berhasil di jalankan</h1>")
})



app.post('/users/input', (req, res) => {

    const {name, email, age, password} = req.body

    const data_name = name
    const data_email = email
    const data_age = age
    const data_password = password


    // Create new object user
    const person = new User({
        name: data_name, 
        email: data_email,
        password: data_password, 
        age: data_age


    })

    // ES7
    // try {
    //     var result = await person.save()
    //     res.send(result)
    // } catch (err) {
    //     res.send(err.message)
    // }

    // ES 6
    person.save()
    .then(result => {
        res.send(result)
    }).catch(err => {
        res.send(err.message)
    })

})



// KONFIGURASI MULTER AKA UPLOAD GAMBAR
const upload = multer({
    limits: {
        fileSize: 10000000000000000000000000000000000000000000000000000 // byte
    },
    fileFilter(req, file, cb){
       var sabi =  file.originalname.match(/\.(jpg|jpeg|png)$/)

       if(!sabi) {
           cb(new Error('Tolong update file dengan format yang benar!'))
       }

       // file masuk 
       cb(undefined, true)
    }   
})


//CREATE AVATAR

app.get('/users/:id/avatar', async (req, res) => {
    // get user, kirim foto
    const user = await User.findById(req.params.id)

    if(!user || !user.avatar){
        throw new Error('Foto / User tidak ada')
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar) // default: ContentType : application/json
})


app.post('/users/:id/avatar', upload.single('avatar'), (req, res) => {
    const data_id = req.params.id
    
    // merubah ukuran dan merubah extesi png
    sharp(req.file.buffer).resize({width: 250}).png().toBuffer()
    .then(buffer => {
        //hasil resize ada di buffer
        //Cari user berdasarkan id
        User.findById(data_id)
        .then(user => {
            // simpan buffer di property avatar punyanya user

            user.avatar = buffer

            // simpan user
            user.save()
            .then(() => {
                res.send('Upload bisa!')
            })
        }) //// disini bisa pakai catch atau es7
    })
})

// READ ALL USERS
app.get('/users', (req, res) => {

    User.find()
        .then(result => {
            // result: array of object
            res.send(result)
        })
})





// READ ONE USER BY ID
// Task
// Handle error jika user tidak di temukan
// berikan respon "Data tidak ditemukan"
// app.get('/users/:id', (req, res) => {
//     const data_id = req.params.id

//     // Search  by id
//     User.findById(data_id)
//         .then(result => {
//             // result : {_id, name, password, email, age}
//             res.send(result)
//         }).catch((err => {
//             res.send({
//                 message: "Data gagal ditemukan",
//                 data: err
//             })
            
//         }))
    
// })
// cari tahu kenapa gak bisa kalau pakai yang diatas


// YANG BENARR
app.get('/users/:id', (req, res) => {
    const data_id = req.params.id

    // Search  by id
    User.findById(data_id)
        .then(user => {
            // user : {_id, name, password, email, age}

            // jika user tidak ditemukan
            if(!user){
                return res.send(`User dengan id ${data_id} tidak ditemukan`)
            }

            // jika user ditemukan
            res.send(user)
            
        }) 
})

// UPDATE NAME BY ID
// Task
// Kasih pesan jika user tidak di temukan
//  "User tidak di temukan"
// app.patch('/users/:id', (req, res) => {
//     const data_id = req.params.id
//     const data_newname = req.body.nameBaru

//     User.findById(data_id)
//         .then(user => {
//             // user : {_id, name, password, email, age}

//             // ubah nama dengan yang baru
//             user.name = data_newname

//             // simpan perubahan data
//             user.save()

//             res.send('Update telah berhasil')
//         }).catch((err => {
//             res.send({
//                 message: "User tidak ditemukan",
//                 data: err
//             })
            
//         }))
// })

// PATCH UNTUK SEMUA 

app.patch('/users/:id', upload.single('ravatar'), (req,res) => {
    // var {name, email, age, password} = req.body




    let arrayBody = Object.keys(req.body)
    // req.body {name, email, age, password}
    // arrayBody [name, email, age, password]
    arrayBody.forEach(key => {
        if(!req.body[key]){
            delete req.body[key]
        }
    })
    // req.body {name, email, age}
    // arrayBody [name, email, age]
    arrayBody = Object.keys(req.body)

    const data_id = req.params.id
    // const data_name = name
    // const data_email = email
    // const data_age = age
    // const data_password = password


    User.findById(data_id)
    . then(user => {
        
        if(!user) {
            return res.send("User tidak ditemukan")
        }

        // user.name = data_name
        // user.email = data_email
        // user.password = data_password
        // user.age = data_age

        // update user
            // arrayBody [name, email, age]
            arrayBody.forEach(key => {
                user[key] = req.body[key]
            })


        sharp(req.file.buffer).resize({width: 25000000000000000000}).png().toBuffer()
            .then(buffer => {

                user.avatar = buffer

                user.save()
                    .then(() => {
                        res.send('Update Profile Berhasil')
                    })

            })

    })

})



// YANG BENARRR
// app.patch('/users/:id', (req, res) => {
//     const data_id = req.params.id
//     const data_newname = req.body.nameBaru

//     User.findById(data_id)
//         .then(user => {
//             // user : {_id, name, password, email, age}

//             if(!user){
//                 return res.send("User tidak di temukan")
//             }

//             // ubah nama dengan yang baru
//             user.name = data_newname

//             // simpan perubahan data
//             user.save()
//                 .then(() => {
//                     res.send('Update telah berhasil')
//                 })
            
//         })
// })


// Task
// DELETE USER BY ID : findByIdAndDelete
// Kasih pesan jika user tidak di temukan

app.delete('/users/:id', (req, res) => {
    const data_id = req.params.id

    User.findByIdAndDelete(data_id)
        .then(user => {
            
            if(!user){
                return res.send("User tidak di temukan")
            }

            res.send({
                data: user,
                message: "User berhasil di hapus"
            })

        })
})


// BEDA SKEMA
// CREATE ONE TASK
// app.post('/tasks/input', (req, res) => {
//     const data_desc = req.body.description

//     const task = new Task({description: data_desc})

//     task.save()
//         .then(result => {
//             res.send(result)
//         })
// })

// YANG INI
// LOGIN USER
app.post('/users/login', async (req, res) => {
    const data_email = req.body.email
    const data_pass = req.body.password


    try {
        const hasil = await User.loginWithEmail(data_email, data_pass)
        res.send(hasil)
    } catch (error) { // Berasal dari throw di function loginWithEmail
        res.send(error.message)
    }

    
})

// CREATE ONE TASK
app.post('/tasks/:userid', (req, res) => {
    const data_desc = req.body.description
    const data_id = req.params.userid

    // Cari user berdasarkan id
    User.findById(data_id)
        .then(user => {
            // Jika user tidak ditemukan
            if(!user){
                res.send('Unable to create task')
            }

            // Membuat task {_id, desc, compl, owner}
            const task = new Task({
                description: data_desc,
                owner: data_id
            })

            // Masukkan id dari task yg sudah di buat ke array 'tasks' pada user
            user.tasks = user.tasks.concat(task._id)

            user.save()
                .then(() => {
                    task.save()
                        .then(() => {
                            res.send(task)
                        })
                })

        })
})




// READ TASKS BY USER ID
// app.get('/tasks/:userid', (req, res) => {

//     // Mencari user berdasarkan Id
//     User.findById(req.params.userid)
//         .populate({path: 'tasks'}).exec() // Mencari data ke tasks berdasarkan task id untuk kemudian di kirim sebagai respon
//         .then(user => {
//             // Jika user tidak ditemukan
//             if(!user){
//                 res.send('Unable to read tasks')
//             }

//             // Kirim respon hanya untuk field (kolom) tasks
//             res.send(user.tasks)

//         })
// })

// READ TASKS BY USER ID
app.get('/tasks/:userid', (req, res) => {

    // Mencari user berdasarkan Id
    User.findById(req.params.userid)
        .populate(
            {
                path: 'tasks',
                options: {
                    // sorting data secara descending berdasarkan field completed
                    // 1 = Ascending : false -> true
                    // -1 = Descending : true -> false
                    sort: {
                        completed: 1
                    }
                }
            }
        ).exec() // Mencari data ke tasks berdasarkan task id untuk kemudian di kirim sebagai respon
        .then(user => {
            // Jika user tidak ditemukan
            if(!user){
                res.send('Unable to read tasks')
            }

            // Kirim respon hanya untuk field (kolom) tasks
            res.send(user.tasks)

        })
})




//UPDATE ONE TASK BY ID
// app.patch('/tasks/:id', (req, res) => {
//     const data_id = req.params.id

//     Task.findById(data_id)
//         .then(task => {
//             // task: {description, completed}
//             task.completed = false

//             task.save()
//                 .then(task => {
//                     res.send(task)
//                 })
//         })

// })

// dicoba sih gakbisa
// app.patch('/tasks/:owner', (req, res) => {
//     const data_id = req.params.owner

//     Task.findById(data_id)
//         .then(task => {
//             // task: {description, completed}
//             task.completed = false

//             task.save()
//                 .then(task => {
//                     res.send(task)
//                 })
//         })

// })

app.patch('/tasks/:userid/:taskid', (req, res) => {
    const data_userid = req.params.userid
    const data_taskid = req.params.taskid
    // Menemukan user by id
    User.findById(data_userid)
        .then(user => {
            if(!user) {
                return res.send('User tidak ditemukan')
            }

            // Menemukan task by id
            Task.findOne({_id: data_taskid})
                .then(task => {
                    if(!task) {
                        return res.send('Task tidak ditemukan')
                    }

                    // Ubah nilai false menjadi true
                    task.completed = !task.completed

                    task.save()
                        .then(()=>{
                            res.send('Selesai dikerjakan')
                        })
                })
        })

})



// DELETE ONE TASK BY ID
app.delete('/tasks/:id', (req, res) => {
    const data_id = req.params.id

    Task.findByIdAndDelete(data_id)
        .then(task => {
            res.send(task)
        })
})








app.listen(port, () => {
    console.log('Berjalan di port ' + port)
})

