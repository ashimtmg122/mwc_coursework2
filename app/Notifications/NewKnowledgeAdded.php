<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewKnowledgeAdded extends Notification implements ShouldQueue // <--- Added Queue for performance
{
    use Queueable;

    public $item;
    public $publisherName;

    public function __construct($item, $publisherName)
    {
        $this->item = $item;
        $this->publisherName = $publisherName;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
           
            'message' => $this->publisherName . ' published: "' . $this->item->title . '"',
            'document_id' => $this->item->id,
            'link' => '/dashboard/knowledge/' . $this->item->id
        ];
    }
}
