const Donation = require('../models/donationModel');
const catchAsync = require('../middleware/catchAysnc');
const AppError = require('../middleware/appError');
require("dotenv").config();
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


exports.setCharityDonorIds = (req,res,next)=>{
    if(!req.body.charity)req.body.charity = req.params.charityId;
    if(!req.body.donor)req.body.donor = req.user.id;
    next();
}

exports.createDonation = catchAsync( async (req,res,next)=>{
    const donate = await Donation.create(req.body);
    donate.password = undefined;
      res.status(201).json({
          status:'success',
          data:donate
      })
})
exports.createStripePayment = catchAsync(async (req,res,next)=>{
    let body = req.body;
    body = JSON.parse(body);
    console.log(body);
    const data = {
        comment:"",
        donate:body.amount,
        campaign:body.campaignId,
        user:body.userId,
        currency: "USD",
        status: "CREATED"
      }
      const donation = await this.createDonation(data);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: body.amount * 100,
        currency: body.currency,
        metadata: {
          donationId: donation.id
        }
      })
  
      return res.send({
        clientSecret: paymentIntent.client_secret
      })
    
    // const paymentIntent = await stripe.paymentIntents.create({
    //     amount: 1099,
    //     currency: 'eur',
    //     automatic_payment_methods: {
    //       enabled: true,
    //     },
    //   });
    
    //   res.json({
    //     paymentIntent: paymentIntent.client_secret,
    //     // ephemeralKey: ephemeralKey.secret,
    //     // customer: customer.id,
    //     publishableKey: process.env.STRIPE_PUBLIC_KEY
    //   });

})

exports.getAllDonation = catchAsync(async (req,res,next)=>{
    console.log("inside the get");
    const donations = await Donation.find();
    if(!donations){
        return next(new AppError('There is no donations',404))
    }
    res.status(200).json({
        status:'success',
        count:donations.length,
        data:donations
    })
})
exports.getUserDonation = catchAsync(async (req,res,next)=>{
   
    const donate = await Donation.find({donor:req.user.id});
    if(!donate){
        return next(new AppError('No donation existed with the id',404))
    }
  
    res.status(200).json({
        status:'success',
        count : donate.length,
        data:donate

        

    })
})



exports.getDonation = catchAsync(async (req,res,next)=>{
    const donate = await Donation.findById(req.params.id);
    if(!donate){
        return next( new AppError('There is no donation with id',404))
    }
    res.status(200).json({
        status:'success',
        data:donate
    })
})
exports.updateDonation = catchAsync(async (req,res,next)=>{
    const donate = await Donation.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })
    if(!donate){
        return next(new AppError('There is no donation with id',404))
    }
    res.status(200).json({
        status:'success',
        data:donate
    })
})
exports.deleteDonation = catchAsync(async (req,res,next)=>{
    const donate = await Donation.findByIdAndDelete(req.params.id);
    if(!donate){
        return next(new AppError('There is no donation with Id',404))
    }
    res.status(200).json({
        status:'success',
        message:"donation with the Id is deleted successfully"
    })
})

exports.getDonationStats = catchAsync( async(req,res,next)=>{

    const stats = await Donation.aggregate([
        
            {
                $match: { donate:{$gte:0} }
              },
            
              {
                  $group:{
                  _id:{$toUpper:'$DonationOption'},
                  sumDonation:{$sum:'$donate'}
              }
            }
    ])
   
    res.status(200).json({
        status:"success",
        data:stats
    })
})

