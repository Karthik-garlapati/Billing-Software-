import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CommunicationTab = ({ clientId }) => {
  const [newNote, setNewNote] = useState('');
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);

  const communications = [
    {
      id: 1,
      type: 'email',
      subject: 'Invoice INV-2024-003 Payment Reminder',
      content: `Dear Client,\n\nThis is a friendly reminder that Invoice INV-2024-003 for $3,200.00 is now overdue. The payment was due on July 15, 2024.\n\nPlease process the payment at your earliest convenience to avoid any service interruptions.\n\nBest regards,\nBillTracker Pro Team`,
      date: '2024-08-10T10:30:00',
      status: 'sent',
      direction: 'outbound'
    },
    {
      id: 2,
      type: 'note',
      subject: 'Client Meeting Notes',
      content: `Had a productive meeting with the client today. Discussed:\n- Upcoming project requirements\n- Payment schedule adjustments\n- Additional services needed\n\nClient seems satisfied with our services and is looking to expand the scope of work.`,
      date: '2024-08-05T14:15:00',
      status: 'completed',
      direction: 'internal'
    },
    {
      id: 3,
      type: 'email',
      subject: 'Re: Invoice INV-2024-002 Payment Confirmation',
      content: `Thank you for your payment of $1,800.00 for Invoice INV-2024-002. The payment has been received and processed successfully.\n\nYour account is now up to date. We appreciate your prompt payment.`,
      date: '2024-07-25T09:45:00',
      status: 'sent',
      direction: 'outbound'
    },
    {
      id: 4,
      type: 'phone',
      subject: 'Payment Discussion',
      content: `Called client regarding overdue invoice INV-2024-003. Client mentioned cash flow issues but committed to payment by end of month. Agreed to send a formal payment plan proposal.`,
      date: '2024-07-20T16:20:00',
      status: 'completed',
      direction: 'outbound'
    },
    {
      id: 5,
      type: 'email',
      subject: 'Welcome to BillTracker Pro',
      content: `Welcome to BillTracker Pro! We're excited to work with you.\n\nThis email confirms your account setup and our service agreement. You can expect your first invoice within the next few days.\n\nIf you have any questions, please don't hesitate to reach out.`,
      date: '2024-04-01T11:00:00',
      status: 'sent',
      direction: 'outbound'
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email':
        return 'Mail';
      case 'phone':
        return 'Phone';
      case 'note':
        return 'FileText';
      case 'meeting':
        return 'Users';
      default:
        return 'MessageSquare';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'email':
        return 'text-blue-600';
      case 'phone':
        return 'text-green-600';
      case 'note':
        return 'text-purple-600';
      case 'meeting':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDirectionIcon = (direction) => {
    switch (direction) {
      case 'inbound':
        return 'ArrowDown';
      case 'outbound':
        return 'ArrowUp';
      case 'internal':
        return 'User';
      default:
        return 'MessageSquare';
    }
  };

  const handleAddNote = () => {
    if (newNote?.trim()) {
      // In a real app, this would save to the backend
      console.log('Adding note:', newNote);
      setNewNote('');
      setShowNewNoteForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-semibold text-foreground">Communication History</h3>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Mail"
              iconPosition="left"
            >
              Send Email
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              iconName="Phone"
              iconPosition="left"
            >
              Log Call
            </Button>
            
            <Button
              variant="default"
              size="sm"
              iconName="Plus"
              iconPosition="left"
              onClick={() => setShowNewNoteForm(true)}
            >
              Add Note
            </Button>
          </div>
        </div>
      </div>
      {/* New Note Form */}
      {showNewNoteForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-medium text-foreground mb-4">Add New Note</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
              <input
                type="text"
                placeholder="Enter note subject..."
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Note Content</label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e?.target?.value)}
                rows={4}
                placeholder="Enter your note here..."
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleAddNote}
                disabled={!newNote?.trim()}
              >
                Save Note
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowNewNoteForm(false);
                  setNewNote('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Communication Timeline */}
      <div className="space-y-4">
        {communications?.map((comm) => (
          <div key={comm?.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getTypeColor(comm?.type)}`}>
                <Icon name={getTypeIcon(comm?.type)} size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-foreground">{comm?.subject}</h4>
                    <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                      {comm?.type}
                    </span>
                    <Icon 
                      name={getDirectionIcon(comm?.direction)} 
                      size={14} 
                      className="text-muted-foreground" 
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(comm.date)?.toLocaleDateString()} at {new Date(comm.date)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    <button className="p-1 hover:bg-muted rounded transition-smooth">
                      <Icon name="MoreHorizontal" size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {comm?.content}
                </div>
                
                {comm?.type === 'email' && (
                  <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-border">
                    <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-smooth">
                      <Icon name="Reply" size={14} />
                      <span>Reply</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-smooth">
                      <Icon name="Forward" size={14} />
                      <span>Forward</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-smooth">
                      <Icon name="Download" size={14} />
                      <span>Download</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="sm">
          Load More Communications
        </Button>
      </div>
    </div>
  );
};

export default CommunicationTab;