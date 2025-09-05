'use strict';

const PushNotification = require('../../models/PushNotifications');

const STATUS = {
  New: 'New',
  Assigned: 'Assigned',
  Inprogress: 'Inprogress',
  Resolved: 'Resolved',
  Close: 'Close',
};

/**
 * Build the notification title/category/message based on status.
 * Note: We keep category stable (support_ticket on create, support_ticket_status on updates)
 * so you can filter easily on the frontend.
 */
function getMessageForStatus(status, ticket) {
  if (!ticket) return null;

  const subject = ticket.subject || 'Ticket';
  const code = ticket.ticketCode ? ` (${ticket.ticketCode})` : '';
  const base = `"${subject}"${code}`;

  switch (status) {
    case STATUS.New:
      return {
        title: 'Support Ticket Created',
        category: 'support_ticket',
        message: `Your support ticket ${base} was created with status: New.`,
      };

    case STATUS.Assigned:
      return {
        title: 'Support Ticket Assigned',
        category: 'support_ticket_status',
        message: `Your support ticket ${base} has been assigned to ${ticket.assignedTo || 'a support agent'}.`,
      };

    case STATUS.Inprogress:
      return {
        title: 'Support Ticket In Progress',
        category: 'support_ticket_status',
        message: `Your support ticket ${base} is now in progress.`,
      };

    case STATUS.Resolved:
      return {
        title: 'Support Ticket Resolved',
        category: 'support_ticket_status',
        message: `Your support ticket ${base} has been resolved.`,
      };

    case STATUS.Close:
      return {
        title: 'Support Ticket Closed',
        category: 'support_ticket_status',
        message: `Your support ticket ${base} has been closed.`,
      };

    default:
      return null;
  }
}

/**
 * Dedupe exactly like Task: do not insert when a notification with the same
 * { ownerId, category, message } already exists.
 */
async function createOrSkipNotification({
  ownerId,
  tenantId,
  title,
  message,
  category,
  type = 'system',
}) {
  const ownerIdStr = String(ownerId || '');
  if (!ownerIdStr) return;

  const tenantIdStr = tenantId ? String(tenantId) : '';
  const exists = await PushNotification.findOne({ ownerId: ownerIdStr, category, message });
  if (exists) return;

  await PushNotification.create({
    ownerId: ownerIdStr,
    tenantId: tenantIdStr,
    title,
    message,
    type,
    category,
    unread: true,
  });
}

/**
 * Call this right after creating the ticket.
 * Uses the ticket.status if present else falls back to New.
 */
async function notifyOnTicketCreated(ticket) {
  const status = ticket?.status || STATUS.New;
  const payload = getMessageForStatus(status, ticket);
  if (!payload) return;

  await createOrSkipNotification({
    ownerId: ticket.ownerId,
    tenantId: ticket.tenantId,
    ...payload,
  });
}

/**
 * Call this after a successful status update (and only if the status actually changed).
 */
async function notifyOnStatusChange({ prevStatus, nextStatus, ticket }) {
  if (!ticket || !nextStatus || prevStatus === nextStatus) return;
  const payload = getMessageForStatus(nextStatus, ticket);
  if (!payload) return;

  await createOrSkipNotification({
    ownerId: ticket.ownerId,
    tenantId: ticket.tenantId,
    ...payload,
  });
}

module.exports = {
  STATUS,
  getMessageForStatus,
  notifyOnTicketCreated,
  notifyOnStatusChange,
};