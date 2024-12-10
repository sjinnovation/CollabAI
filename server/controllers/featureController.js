import mongoose from 'mongoose';
import Feature from '../models/featureModel.js'

export const createFeature = async (req, res) => {
    try{
        console.log(req.params);
        const newFeature = new Feature(req.body);
        const savedFeature = await newFeature.save();
        res.status(201).json(savedFeature);
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Error saving feature", error:err});
    }
};

export const getAllFeatures = async (req, res) => {
    try{
        const features= await Feature.find();
        res.status(200).json(features);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message: "Error getting features", error:err});
    }
}


