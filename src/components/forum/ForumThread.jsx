// ForumThread.jsx
import React, { useState } from 'react';
import { VoteTypes, UserRoles, AssignmentStatus } from './forumTypes';
import { forumUsers, forumCategories } from './forumData';

const ForumThread = ({ thread, currentUserId, onVote, onReply, onAssign }) => {
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  const getAuthor = (userId) => forumUsers.find(u => u.id === userId);
  const getCategory = (categoryId) => forumCategories.find(c => c.id === categoryId);
  
  const calculateVotes = (votes) => {
    return votes.reduce((sum, vote) => sum + vote.vote, 0);
  };

  const handleVote = (targetId, isComment = false, voteType) => {
    onVote(targetId, isComment, voteType);
  };

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(thread.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const handleAssign = () => {
    if (selectedUser) {
      onAssign(thread.id, selectedUser);
      setSelectedUser('');
      setShowAssignForm(false);
    }
  };

  const currentUser = forumUsers.find(u => u.id === currentUserId);
  const isModerator = currentUser?.role === UserRoles.MODERATOR || currentUser?.role === UserRoles.FACILITATOR;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold">{thread.title}</h1>
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <span className="mr-2">Posted by {getAuthor(thread.author)?.name}</span>
            <span className="mr-2">•</span>
            <span>{new Date(thread.date).toLocaleDateString()}</span>
            <span className="mr-2">•</span>
            <span>{thread.views} views</span>
          </div>
          <div className="mt-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
              {getCategory(thread.categoryId)?.name}
            </span>
            {thread.tags.map(tag => (
              <span key={tag} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <button 
            onClick={() => handleVote(thread.id, false, VoteTypes.UPVOTE)}
            className="text-gray-400 hover:text-green-500"
          >
            ▲
          </button>
          <span className="my-1 font-semibold">{calculateVotes(thread.votes)}</span>
          <button 
            onClick={() => handleVote(thread.id, false, VoteTypes.DOWNVOTE)}
            className="text-gray-400 hover:text-red-500"
          >
            ▼
          </button>
        </div>
      </div>

      <div className="prose max-w-none mb-6">
        <p>{thread.content}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reply
          </button>
          {isModerator && (
            <button 
              onClick={() => setShowAssignForm(!showAssignForm)}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Assign
            </button>
          )}
        </div>
        {thread.isFeatured && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
            Featured
          </span>
        )}
      </div>

      {showReplyForm && (
        <div className="mb-6">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Write your reply..."
          />
          <div className="flex justify-end mt-2 space-x-2">
            <button 
              onClick={() => setShowReplyForm(false)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmitReply}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Post Reply
            </button>
          </div>
        </div>
      )}

      {showAssignForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Assign to Student</h3>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a student</option>
            {forumUsers
              .filter(u => u.role === UserRoles.STUDENT)
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} (Rep: {user.reputation})
                </option>
              ))}
          </select>
          <div className="flex justify-end mt-2 space-x-2">
            <button 
              onClick={() => setShowAssignForm(false)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              onClick={handleAssign}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Assign
            </button>
          </div>
        </div>
      )}

      {thread.assignments.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-2">Assignments</h3>
          {thread.assignments.map(assignment => (
            <div key={assignment.id} className="flex items-center justify-between p-2 bg-white rounded border mb-2">
              <div>
                <span className="font-medium">{getAuthor(assignment.userId)?.name}</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  assignment.status === AssignmentStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                  assignment.status === AssignmentStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {assignment.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {thread.comments
          .sort((a, b) => (a.isAccepted ? -1 : b.isAccepted ? 1 : 0))
          .map(comment => (
            <div key={comment.id} className={`border rounded-lg p-4 ${
              comment.isAccepted ? 'border-green-300 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <img 
                    src={getAuthor(comment.author)?.avatar} 
                    alt={getAuthor(comment.author)?.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <div className="font-medium">{getAuthor(comment.author)?.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(comment.date).toLocaleDateString()} • 
                      Rep: {getAuthor(comment.author)?.reputation}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleVote(comment.id, true, VoteTypes.UPVOTE)}
                    className="text-gray-400 hover:text-green-500"
                  >
                    ▲
                  </button>
                  <span className="my-1 font-semibold">{calculateVotes(comment.votes)}</span>
                  <button 
                    onClick={() => handleVote(comment.id, true, VoteTypes.DOWNVOTE)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ▼
                  </button>
                </div>
              </div>
              
              <div className="prose max-w-none mb-3">
                <p>{comment.content}</p>
              </div>

              {isModerator && !comment.isAccepted && (
                <button 
                  onClick={() => onAcceptAnswer(thread.id, comment.id)}
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                >
                  Mark as Accepted
                </button>
              )}

              {comment.replies.length > 0 && (
                <div className="ml-8 mt-4 space-y-4">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="border-l-2 border-gray-200 pl-4 py-2">
                      <div className="flex items-center mb-1">
                        <img 
                          src={getAuthor(reply.author)?.avatar} 
                          alt={getAuthor(reply.author)?.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <div className="text-sm font-medium">{getAuthor(reply.author)?.name}</div>
                        <div className="text-xs text-gray-500 ml-2">
                          {new Date(reply.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        {reply.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={() => {
                  const replyTo = document.getElementById(`reply-${comment.id}`);
                  replyTo?.scrollIntoView({ behavior: 'smooth' });
                  setShowReplyForm(true);
                }}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700"
              >
                Reply to this comment
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ForumThread;