const WorkRequest = require('../models/workRequest.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

// Send work request to labour
const sendWorkRequest = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const { 
      labourId, 
      jobType, 
      cropType, 
      farmSize, 
      duration, 
      wage, 
      startDate,
      location,
      requirements,
      message 
    } = req.body;

    if (!labourId) {
      return res.status(400).json({ message: 'Labour ID is required' });
    }

    // Check if labour exists
    const labour = await User.findById(labourId);
    if (!labour || labour.role !== 'labour') {
      return res.status(404).json({ message: 'Labour not found' });
    }

    // Check if request already exists
    const existingRequest = await WorkRequest.findOne({
      farmer: farmerId,
      labour: labourId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request with this labour' });
    }

    // Create work request
    const workRequest = await WorkRequest.create({
      farmer: farmerId,
      labour: labourId,
      jobType,
      cropType,
      farmSize,
      duration,
      wage,
      startDate,
      location,
      requirements,
      message,
      status: 'pending'
    });

    // Get farmer details for notification
    const farmer = await User.findById(farmerId);
    const farmerName = farmer.fullName 
      ? `${farmer.fullName.firstName} ${farmer.fullName.lastName || ''}`.trim()
      : 'A farmer';

    // Create notification for labour
    await Notification.create({
      recipient: labourId,
      sender: farmerId,
      type: 'work_request',
      title: '🔔 New Work Request',
      message: `${farmerName} has sent you a work request${jobType ? ` for ${jobType}` : ''}`,
      isRead: false
    });

    res.status(201).json({
      success: true,
      message: 'Work request sent successfully',
      workRequest
    });

  } catch (error) {
    console.error('Send work request error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get work requests received by labour
const getReceivedRequests = async (req, res) => {
  try {
    const labourId = req.user._id;
    
    const requests = await WorkRequest.find({ labour: labourId })
      .populate('farmer', 'fullName email phone location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get work requests sent by farmer
const getSentRequests = async (req, res) => {
  try {
    const farmerId = req.user._id;
    
    const requests = await WorkRequest.find({ farmer: farmerId })
      .populate('labour', 'fullName email phone location skills experience')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Labour responds to work request
const respondToRequest = async (req, res) => {
  try {
    const labourId = req.user._id;
    const { requestId, status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be accepted or rejected' });
    }

    const workRequest = await WorkRequest.findById(requestId);
    
    if (!workRequest) {
      return res.status(404).json({ message: 'Work request not found' });
    }

    if (workRequest.labour.toString() !== labourId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to respond to this request' });
    }

    if (workRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been responded to' });
    }

    workRequest.status = status;
    workRequest.respondedAt = new Date();
    await workRequest.save();

    // Get labour details for notification
    const labour = await User.findById(labourId);
    const labourName = labour.fullName 
      ? `${labour.fullName.firstName} ${labour.fullName.lastName || ''}`.trim()
      : 'A labour';

    // Create notification for farmer
    await Notification.create({
      recipient: workRequest.farmer,
      sender: labourId,
      type: 'general',
      title: status === 'accepted' ? '✅ Request Accepted' : '❌ Request Rejected',
      message: `${labourName} has ${status} your work request`,
      isRead: false
    });

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      workRequest
    });

  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel work request (farmer)
const cancelRequest = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const { requestId } = req.params;

    const workRequest = await WorkRequest.findById(requestId);
    
    if (!workRequest) {
      return res.status(404).json({ message: 'Work request not found' });
    }

    if (workRequest.farmer.toString() !== farmerId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to cancel this request' });
    }

    if (workRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    workRequest.status = 'cancelled';
    await workRequest.save();

    res.json({
      success: true,
      message: 'Request cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendWorkRequest,
  getReceivedRequests,
  getSentRequests,
  respondToRequest,
  cancelRequest
};
