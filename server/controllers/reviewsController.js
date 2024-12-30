import Review from "../models/reviewsModel.js"

export const createReview =  async (req,res) =>
{
    try{
        const reviews= new Review(req.body);
        const savedReview= await reviews.save();
        res.status(200).json(savedReview);
    }catch(err)
    {
        console.log(err);
        res.status(500).json({message: "Error saving review", error:err});
    }
}

export const getReviews = async (req,res) =>
{
    try{
        const reviews= await Review.find({});
        res.status(200).json(reviews);
    }catch(err)
    {
        console.log(err);
        res.status(500).json({message: "Error retrieving reviews", error:err});
    }
}