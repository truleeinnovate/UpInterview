const SupportUser = require("../models/SupportUser")

exports.createTicket = async(req,res)=>{
    try {
        console.log("Received ticket creation request body:", req.body);
        const {issueType,description,status,contact,priority,ownerId,tenantId,organization,createdByUserId}=req.body 
        if (!issueType){
            return res.status(400).send({message:"Issue type is required"})
        }
        if (!description){
            return res.status(400).send({message:"Description is required"})
        }
        if (!contact) {
            return res.status(400).send({ message: "Contact is required" });
        }
        if (organization && !organization) {
            return res.status(400).send({ message: "Organization is required when organization flag is true" });
        }
        const lastTicket = await SupportUser.findOne({})
                        .sort({ _id: -1 })
                        .select('ticketCode')
                        .lean();
        let nextNumber = 1;
            if (lastTicket && lastTicket.ticketCode) {
                const match = lastTicket.ticketCode.match(/SPT-(\d+)/);
                if (match) {
                    nextNumber = parseInt(match[1], 10) + 1;
                }
            }
        const ticketCode = `SPT-${String(nextNumber).padStart(5, '0')}`;
        const ticket = await SupportUser.create({issueType,description,status,contact,priority,ownerId,tenantId,organization,createdByUserId,ticketCode})
        return res.status(201).send({
            message:"Ticket created successfully",
            success:true,
            ticket
        })
    } catch (error) {
        console.error("Error creating ticket:", error);
        return res.status(500).send({
            message:"Failed to create ticket",
            success:false,
            error: error.message // Sending error.message for better debugging
        })
    }
}

exports.getTicket = async (req, res) => {
  try {
    const tickets = await SupportUser.find();
    return res.status(200).send({
      success: true,
      message: "Tickets retrieved successfully",
      tickets,
    });
  } catch (error) {
    console.log("Error retrieving tickets:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to retrieve tickets",
      error,
    });
  }
};

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
        const {issueType,description,assignedTo,assignedToId}=req.body
        const ticket = await SupportUser.findByIdAndUpdate({_id:id},{
            issueType,description,assignedTo,assignedToId
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
        const { status, comment, user,updatedByUserId,notifyUser } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const ticket = await SupportUser.findById(id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Update ticket fields
        ticket.status = status;
        ticket.updatedByUserId = updatedByUserId;

        // Add to status history
        ticket.statusHistory.unshift({
            notifyUser,
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