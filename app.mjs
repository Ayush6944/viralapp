import express from 'express';
import dotenv from 'dotenv';
import { connect, Schema, model } from 'mongoose';
import pkg from 'body-parser';
import cors from 'cors';
import multer from 'multer';
// import path from 'path';
const app = express();
// const uri = MONGO_URI;

dotenv.config({ 
  path:'./.env'} 
)
const uri=process.env.MONGO_URI
const { json } = pkg;
connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const PORT=process.env.PORT || 4000;



app.use(json());
app.use(cors());

const userSchema = new Schema({
  name: String,
  phone: String,
  profilePhoto: String,
  coverPhoto: String,
  gender: String,
  password: String,
});

const User = model('User', userSchema);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})
const upload = multer({ storage: storage });




// 6645cf27caf450a0d159b158

app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).exec();
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


app.post('/signup', upload.fields([{ name: 'profilePhoto', maxCount: 1 }, 
{ name: 'coverPhoto', maxCount: 1 }]), async (req, res) => {
  try {
    const { name, phone,email, gender } = req.body;
    const profilePhoto = req.files['profilePhoto'].path;
    const coverPhoto = req.files['coverPhoto'].path;
    
    const user = new User({
      name,
      phone,
      profilePhoto,
      coverPhoto,
      gender,
      email
    });
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/users/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: 'Server error', error });
  }
});

app.put('/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(user);
});

app.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send({ message: 'User deleted' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;