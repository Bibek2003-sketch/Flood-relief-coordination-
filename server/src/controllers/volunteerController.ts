import { Request, Response } from 'express';
import Task from '../models/Task';
import User from '../models/User';
import Role from '../models/Role';
import { AuthRequest } from '../middleware/auth';
import { generateToken } from '../utils/jwt';

export const enrollVolunteer = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, contactNumber, location, skills } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: 'First name, last name, and email are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    let roleDoc = await Role.findOne({ name: { $regex: /^volunteer$/i } });
    if (!roleDoc) {
      roleDoc = await Role.create({
        name: 'volunteer',
        description: 'Community volunteer for disaster assistance'
      });
    }

    const userPassword = password && password.trim().length >= 6 
      ? password.trim() 
      : 'Volunteer123!';

    if (user) {
      user.role = roleDoc._id;
      user.roleName = 'volunteer';
      if (user.status !== 'approved') {
        user.status = 'pending';
      }
      if (contactNumber) user.contactNumber = contactNumber;
      if (location) user.organization = location;
      if (skills && Array.isArray(skills)) user.skills = skills;
      if (password && password.trim().length >= 6) {
        user.password = userPassword;
      }
      await user.save();
    } else {
      user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        password: userPassword,
        role: roleDoc._id,
        roleName: 'volunteer',
        status: 'pending',
        contactNumber,
        organization: location,
        skills: Array.isArray(skills) ? skills : []
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('new-volunteer', {
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        location: user.organization,
        skills: user.skills
      });
    }

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: 'volunteer',
      roleName: 'volunteer',
      status: user.status,
      skills: user.skills,
      organization: user.organization
    };

    const isApproved = user.status === 'approved';
    const token = isApproved ? generateToken(String(user._id), 'volunteer') : undefined;

    res.status(201).json({
      success: true,
      message: isApproved
        ? 'Volunteer login authorized!'
        : 'Volunteer application submitted. Your deployment is awaiting administrator approval.',
      status: user.status,
      token,
      user: userData,
      data: userData
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVolunteerTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    // Fetch tasks available (unassigned or AVAILABLE) and tasks assigned to this volunteer
    const [availableTasks, myTasks] = await Promise.all([
      Task.find({
        status: 'AVAILABLE'
      }).sort({ createdAt: -1 }),
      Task.find({
        assignedVolunteer: userId
      }).sort({ updatedAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        availableTasks,
        myTasks
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const user = req.user;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== 'AVAILABLE' && task.assignedVolunteer?.toString() !== userId.toString()) {
      return res.status(400).json({ success: false, message: 'This task has already been claimed by another volunteer' });
    }

    task.assignedVolunteer = userId;
    task.assignedVolunteerName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email;
    task.status = 'IN_PROGRESS';
    task.acceptedAt = new Date();

    await task.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('task-updated', task);
    }

    res.status(200).json({
      success: true,
      message: 'Task accepted successfully',
      data: task
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const declineTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const task = await Task.findOne({
      _id: id,
      assignedVolunteer: userId
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Assigned task not found' });
    }

    task.assignedVolunteer = undefined;
    task.assignedVolunteerName = undefined;
    task.status = 'AVAILABLE';
    task.acceptedAt = undefined;

    await task.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('task-updated', task);
    }

    res.status(200).json({
      success: true,
      message: 'Task declined and returned to pool',
      data: task
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const task = await Task.findOne({
      _id: id,
      assignedVolunteer: userId
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Assigned task not found' });
    }

    task.status = 'COMPLETED';
    task.completedAt = new Date();

    await task.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('task-updated', task);
    }

    res.status(200).json({
      success: true,
      message: 'Task marked as completed! Thank you for your service.',
      data: task
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { isAvailable } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isAvailable = typeof isAvailable === 'boolean' ? isAvailable : !user.isAvailable;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Availability updated to ${user.isAvailable ? 'Available' : 'Unavailable'}`,
      isAvailable: user.isAvailable
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVolunteerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId).select('-password');
    const completedTasksCount = await Task.countDocuments({
      assignedVolunteer: userId,
      status: 'COMPLETED'
    });
    const activeTasksCount = await Task.countDocuments({
      assignedVolunteer: userId,
      status: { $in: ['ACCEPTED', 'IN_PROGRESS'] }
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        completedTasksCount,
        activeTasksCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
