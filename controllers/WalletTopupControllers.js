
const Wallet = require('../models/WalletTopup.js');
const { createInvoice, createReceipt } = require('../utils/CustomerSubscriptionInvoiceContollers.js');

const topUpWallet = async (req, res) => {
    try {
        const { tenantId,ownerId, amount, transactionId, status } =req.body

       const  numericAmount =  Number(amount)
        
        if ( !amount || !transactionId || !status) {
            return res.status(400).json({ message: 'Missing required details.' });
          }
        let wallet = await Wallet.findOne({ ownerId });

        if (!wallet) {
            wallet = new Wallet({ ownerId, balance: 0, transactions: [] });
            await wallet.save();
        }

        if (status === "paid") {
            const invoice = await createInvoice(
                tenantId, 
                ownerId,      
                null,         
                numericAmount,  
                null,         
                status,       
                0,            
                "wallet"    
            );
            

            // Create a receipt
            const receipt = await createReceipt(
                tenantId,
                ownerId,
                invoice._id,
                amount,
                transactionId,
                { cardNumber: "0000" }
                
            );

            wallet.balance += amount;
            wallet.transactions.push({
                type: 'credit',
                amount,
                description: 'Wallet top-up',
                status: 'completed',
                relatedInvoiceId: invoice._id
            });

            await wallet.save();
            res.status(200).json({ message: 'Wallet topped up successfully', wallet });

        }


    } catch (error) {
        console.log(error);

        res.status(400).json({ error: error.message });
    }
};


const getTopUpWallet = async(req,res) => {
    try {    
        const { ownerId } = req.params;
        const walletDetials = await Wallet.find({ ownerId }).lean();;
    
        if (!walletDetials) {
          return res.status(404).json({ message: 'Not found.' });
    
        }
       
        res.status(201).json({
            walletDetials
        });
    
    
    
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error saving payment details', error: err });
      }
}




const deductFromWallet = async (req, res) => {
    try {
        const { tenantId,ownerId, amount, description, relatedInvoiceId } = req.body;


        if ( !amount || !description || !relatedInvoiceId) {
            return res.status(400).json({ message: 'Missing required details.' });
          }

        const wallet = await Wallet.findOne({ ownerId });
        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        wallet.balance -= amount;
        wallet.transactions.push({
            type: 'debit',
            amount,
            description,
            relatedInvoiceId,
            status: 'completed'
        });

        await wallet.save();
        res.status(200).json({ message: 'Transaction completed successfully', wallet });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};




module.exports = { topUpWallet,getTopUpWallet,deductFromWallet }