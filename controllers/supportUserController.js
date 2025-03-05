const SupportUser = require("../models/SupportUser")


exports.createTicket = async(req,res)=>{
    try {
        console.log(req.body)
        const {issueType,description,status,contact,priority,createdDate,owner,organization}=req.body 
        if (!issueType){
            return res.status(400).send({message:"Issue type is required"})
        }
        if (!description){
            return res.status(400).send({message:"Description is required"})
        }
        const ticket = await SupportUser.create({issueType,description,status,contact,priority,createdDate,owner,organization})
        return res.status(201).send({
            message:"Ticket created successfully",
            success:true,
            ticket
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message:"Failed to create ticket",
            success:false,
            error
        })
    }
}

exports.getTicket = async(req,res)=>{
    try {
        const tickets = await SupportUser.find().sort({createdAt:-1})
        return res.status(200).send({
            success:true,
            message:"Tickets retrieved successfully",
            tickets
        })


    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success:false,
            message:"Failed to retrieve tickets",
            error
        })
    }
}


exports.getTicketBasedonId  =async(req,res)=>{
    try {
        const {id}=req.params 
        if (!id){
            return res.status(400).send({message:"ticket id is required"})
        }
        const ticket = await SupportUser.findById({_id:id})
        return res.status(200).send({
            message:"Ticket retrieved successfully",
            ticket,
            ticket
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message:"Failed to get ticket based on id",
            success:false,
            error
        })
    }
}

exports.updateTicketById = async(req,res)=>{
    try {
        const {id}=req.params
        const {issueType,description}=req.body
        const ticket = await SupportUser.findByIdAndUpdate({_id:id},{
            issueType,description
        })

        return res.status(200).send({
            success:true,
            message:"Ticket updated successfully",
            ticket
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message:"Failed to updated ticket based on id",
            error,
            success:false
        })
    }
}

// Update ticket status
exports.updateSupportTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment, user } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const ticket = await SupportUser.findById(id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Update ticket fields
        ticket.status = status;
        ticket.modifiedBy = user || 'Unknown';
        ticket.modifiedDate = new Date();

        // Add to status history
        ticket.statusHistory.unshift({
            status,
            date: new Date(),
            user: user || 'Unknown',
            comment: comment || '',
        });

        const updatedTicket = await ticket.save();
        return res.status(200).json(updatedTicket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        return res.status(500).json({ error: error.message });
    }
};