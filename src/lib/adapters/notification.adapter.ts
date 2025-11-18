/**
 * Notification Adapter Interface
 * Enables sending notifications through various channels
 */

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  IN_APP = 'in_app',
}

export interface NotificationRecipient {
  id?: string;
  email?: string;
  phone?: string;
  slackChannel?: string;
  webhookUrl?: string;
}

export interface NotificationPayload {
  subject?: string;
  message: string;
  data?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface INotificationAdapter {
  /**
   * Channel name
   */
  readonly channel: NotificationChannel;

  /**
   * Send a notification
   */
  send(
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<NotificationResult>;

  /**
   * Check if adapter is available
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Console Notification Adapter (for development)
 */
export class ConsoleNotificationAdapter implements INotificationAdapter {
  readonly channel = NotificationChannel.IN_APP;

  async send(
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    console.log('[Notification]', {
      recipient,
      subject: payload.subject,
      message: payload.message,
      priority: payload.priority || 'normal',
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: `console_${Date.now()}`,
    };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

/**
 * Notification Adapter Registry
 */
class NotificationAdapterRegistry {
  private adapters: Map<NotificationChannel, INotificationAdapter> = new Map();

  constructor() {
    // Register console adapter by default
    this.register(new ConsoleNotificationAdapter());
  }

  register(adapter: INotificationAdapter): void {
    this.adapters.set(adapter.channel, adapter);
  }

  get(channel: NotificationChannel): INotificationAdapter | undefined {
    return this.adapters.get(channel);
  }

  listChannels(): NotificationChannel[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Send notification via specified channel
   */
  async send(
    channel: NotificationChannel,
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    const adapter = this.get(channel);
    if (!adapter) {
      throw new Error(`Notification adapter for channel "${channel}" not found`);
    }
    return adapter.send(recipient, payload);
  }
}

// Export singleton registry
export const notificationRegistry = new NotificationAdapterRegistry();
