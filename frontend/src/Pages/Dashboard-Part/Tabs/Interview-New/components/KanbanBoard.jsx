import React, { useState, useEffect } from 'react';
import InterviewCard from './InterviewCard';
import { motion } from 'framer-motion';

function KanbanBoard({ interviews,onView,onViewPosition }) {
  // Group interviews by status
  const inProgressInterviews = interviews?.filter(interview => interview.status === 'In Progress' || interview.status === 'Scheduled'|| interview.status === 'Rescheduled'|| interview.status === 'Draft');
  const completedInterviews = interviews?.filter(interview => interview.status === 'Completed');
  const cancelledInterviews = interviews?.filter(interview => interview.status === 'Cancelled');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div 
        className="bg-secondary/50 rounded-lg p-4 border border-border"
        variants={item}
      >
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">In Progress</h3>
          <span className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {inProgressInterviews.length}
          </span>
        </div>
        <div className="space-y-4">
          {inProgressInterviews.length > 0 ? (
            inProgressInterviews.map(interview => (
              <InterviewCard key={interview._id} interview={interview} />
            ))
          ) : (
            <div className="text-center py-8 bg-background rounded-lg border border-dashed border-border">
              <p className="text-muted-foreground">No interviews in progress</p>
            </div>
          )}
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-secondary/50 rounded-lg p-4 border border-border"
        variants={item}
      >
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">Completed</h3>
          <span className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {completedInterviews.length}
          </span>
        </div>
        <div className="space-y-4">
          {completedInterviews.length > 0 ? (
            completedInterviews.map(interview => (
              <InterviewCard key={interview._id} interview={interview} />
            ))
          ) : (
            <div className="text-center py-8 bg-background rounded-lg border border-dashed border-border">
              <p className="text-muted-foreground">No completed interviews</p>
            </div>
          )}
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-secondary/50 rounded-lg p-4 border border-border"
        variants={item}
      >
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">Cancelled</h3>
          <span className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {cancelledInterviews.length}
          </span>
        </div>
        <div className="space-y-4">
          {cancelledInterviews.length > 0 ? (
            cancelledInterviews.map(interview => (
              <InterviewCard key={interview._id} interview={interview} onView={onView || (() => {})} onViewPosition={onViewPosition || (() => {})}/>
            ))
          ) : (
            <div className="text-center py-8 bg-background rounded-lg border border-dashed border-border">
              <p className="text-muted-foreground">No cancelled interviews</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default KanbanBoard;