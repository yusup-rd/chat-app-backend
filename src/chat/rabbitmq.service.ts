import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  private connection: any = null;
  private channel: any = null;
  private readonly logger = new Logger(RabbitMQService.name);
  private readonly QUEUE_NAME = 'chat_messages';

  async connect(): Promise<void> {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(this.QUEUE_NAME, {
        durable: true,
      });
    } catch {
      this.logger.warn(
        'RabbitMQ not available, continuing without message queuing',
      );
    }
  }

  async publishMessage(message: any): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      if (!this.channel) {
        this.logger.warn(
          'RabbitMQ channel not available, skipping message queuing',
        );
        return;
      }

      const messageBuffer = Buffer.from(JSON.stringify(message));

      this.channel.sendToQueue(this.QUEUE_NAME, messageBuffer, {
        persistent: true,
      });
    } catch {
      this.logger.warn(
        'Failed to publish message to RabbitMQ, continuing without queuing',
      );
    }
  }

  async consumeMessages(callback: (message: any) => void): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      if (!this.channel) {
        throw new Error('Failed to establish RabbitMQ channel');
      }

      await this.channel.consume(
        this.QUEUE_NAME,
        (msg) => {
          if (msg && this.channel) {
            const messageContent = JSON.parse(msg.content.toString());
            callback(messageContent);
            this.channel.ack(msg);
          }
        },
        {
          noAck: false,
        },
      );
    } catch (error) {
      this.logger.error('Failed to consume messages', error);
      throw error;
    }
  }

  async closeConnection(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.connection = null;
      this.channel = null;
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error);
    }
  }
}
