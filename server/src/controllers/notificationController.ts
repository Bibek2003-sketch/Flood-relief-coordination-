import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const roleRaw = req.user?.roleName || (typeof req.user?.role === 'string' ? req.user?.role : req.user?.role?.name) || '';
    const role = String(roleRaw).toLowerCase();
    const normalizedRole = role.includes('admin') ? 'admin' :
      role.includes('rescue') ? 'rescue' :
      role.includes('volunteer') ? 'volunteer' :
      role.includes('ngo') ? 'ngo' : 'all';

    const queryFilter: any = {
      $or: [
        { targetRole: normalizedRole },
        { targetRole: 'all' }
      ]
    };

    if (userId) {
      queryFilter.$or.unshift({ recipient: userId });
    }

    const notifications = await Notification.find(queryFilter)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      ...queryFilter,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      data: notifications
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const role = (req.user?.role || '').toLowerCase();
    const normalizedRole = role.includes('admin') ? 'admin' :
      role.includes('rescue') ? 'rescue' :
      role.includes('volunteer') ? 'volunteer' :
      role.includes('ngo') ? 'ngo' : 'all';

    await Notification.updateMany(
      {
        $or: [
          { recipient: userId },
          { targetRole: normalizedRole },
          { targetRole: 'all' }
        ],
        isRead: false
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
