import express from "express";
import multer from 'multer';
import path from 'path'; 
import { addModel, deleteModel,checkModelFieldAvailability, listModels, processModel, editModel } from "../controllers/huggingFaceController.js";

// const upload = multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only jpeg and png files
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .png files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB size limit
});

const router = express.Router();

//add models
router.post('/', upload.single('image_url'), addModel);

//list models
router.get("/", listModels);

// Process models
router.post("/process", processModel);

// Delete models by name
router.delete("/nickname/:nickname", deleteModel);

// Edit models by id
router.put('/:_id', upload.single('image_url'), editModel);

//uniquenes
router.get("/check-field/:field/:value", checkModelFieldAvailability);



export default router;