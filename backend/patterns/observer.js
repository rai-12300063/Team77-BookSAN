/**
 * Observer Pattern - Implements a publish-subscribe mechanism
 * Use case: Notifying various systems when learning events occur
 */

// Subject (Observable) interface
class Subject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
    console.log(`📢 Observer subscribed: ${observer.constructor.name}`);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
    console.log(`📤 Observer unsubscribed: ${observer.constructor.name}`);
  }

  notify(event, data) {
    console.log(`🔔 Notifying ${this.observers.length} observers about: ${event.type}`);
    this.observers.forEach(observer => {
      try {
        observer.update(event, data);
      } catch (error) {
        console.error(`❌ Error notifying observer ${observer.constructor.name}:`, error.message);
      }
    });
  }
}

// Concrete Subject - Learning Progress Tracker
class LearningProgressTracker extends Subject {
  constructor() {
    super();
    this.userProgress = new Map();
  }

  updateProgress(userId, courseId, progress, timeSpent) {
    const oldProgress = this.userProgress.get(`${userId}-${courseId}`) || { progress: 0, timeSpent: 0 };
    const newProgress = { progress, timeSpent, updatedAt: new Date() };
    
    this.userProgress.set(`${userId}-${courseId}`, newProgress);

    // Notify observers about progress update
    this.notify({
      type: 'PROGRESS_UPDATED',
      userId,
      courseId,
      oldProgress,
      newProgress
    }, newProgress);

    // Check for milestone achievements
    this.checkMilestones(userId, courseId, oldProgress.progress, progress);
  }

  checkMilestones(userId, courseId, oldProgress, newProgress) {
    const milestones = [25, 50, 75, 100];
    
    for (const milestone of milestones) {
      if (oldProgress < milestone && newProgress >= milestone) {
        this.notify({
          type: 'MILESTONE_ACHIEVED',
          userId,
          courseId,
          milestone
        }, { milestone, progress: newProgress });
      }
    }
  }

  enrollUser(userId, courseId) {
    this.notify({
      type: 'USER_ENROLLED',
      userId,
      courseId
    }, { enrolledAt: new Date() });
  }

  completeAssignment(userId, courseId, assignmentId, score) {
    this.notify({
      type: 'ASSIGNMENT_COMPLETED',
      userId,
      courseId,
      assignmentId,
      score
    }, { score, completedAt: new Date() });
  }
}

// Observer interface
class Observer {
  update(event, data) {
    throw new Error('update() method must be implemented');
  }
}

// Concrete Observers
class EmailNotificationObserver extends Observer {
  constructor(emailService) {
    super();
    this.emailService = emailService;
  }

  update(event, data) {
    switch (event.type) {
      case 'PROGRESS_UPDATED':
        if (event.newProgress.progress - event.oldProgress.progress >= 10) {
          this.sendProgressEmail(event.userId, event.courseId, event.newProgress.progress);
        }
        break;
      
      case 'MILESTONE_ACHIEVED':
        this.sendMilestoneEmail(event.userId, event.courseId, event.milestone);
        break;
      
      case 'USER_ENROLLED':
        this.sendWelcomeEmail(event.userId, event.courseId);
        break;
      
      case 'ASSIGNMENT_COMPLETED':
        this.sendAssignmentCompleteEmail(event.userId, event.courseId, event.assignmentId, event.score);
        break;
    }
  }

  sendProgressEmail(userId, courseId, progress) {
    console.log(`📧 Email: Progress update - User ${userId} is ${progress}% complete in course ${courseId}`);
  }

  sendMilestoneEmail(userId, courseId, milestone) {
    console.log(`🎉 Email: Milestone achieved - User ${userId} reached ${milestone}% in course ${courseId}`);
  }

  sendWelcomeEmail(userId, courseId) {
    console.log(`👋 Email: Welcome - User ${userId} enrolled in course ${courseId}`);
  }

  sendAssignmentCompleteEmail(userId, courseId, assignmentId, score) {
    console.log(`✅ Email: Assignment complete - User ${userId} scored ${score}% on assignment ${assignmentId}`);
  }
}

class AnalyticsObserver extends Observer {
  constructor() {
    super();
    this.analytics = {
      progressUpdates: 0,
      milestonesAchieved: 0,
      enrollments: 0,
      assignmentsCompleted: 0
    };
  }

  update(event, data) {
    switch (event.type) {
      case 'PROGRESS_UPDATED':
        this.analytics.progressUpdates++;
        this.trackProgressUpdate(event, data);
        break;
      
      case 'MILESTONE_ACHIEVED':
        this.analytics.milestonesAchieved++;
        this.trackMilestone(event, data);
        break;
      
      case 'USER_ENROLLED':
        this.analytics.enrollments++;
        this.trackEnrollment(event, data);
        break;
      
      case 'ASSIGNMENT_COMPLETED':
        this.analytics.assignmentsCompleted++;
        this.trackAssignmentCompletion(event, data);
        break;
    }
  }

  trackProgressUpdate(event, data) {
    console.log(`📊 Analytics: Progress tracked - User ${event.userId}, Course ${event.courseId}, Progress: ${data.progress}%`);
  }

  trackMilestone(event, data) {
    console.log(`🎯 Analytics: Milestone tracked - User ${event.userId}, Milestone: ${event.milestone}%`);
  }

  trackEnrollment(event, data) {
    console.log(`📈 Analytics: Enrollment tracked - User ${event.userId}, Course ${event.courseId}`);
  }

  trackAssignmentCompletion(event, data) {
    console.log(`📝 Analytics: Assignment tracked - User ${event.userId}, Score: ${event.score}%`);
  }

  getStats() {
    return this.analytics;
  }
}

class BadgeSystemObserver extends Observer {
  constructor() {
    super();
    this.userBadges = new Map();
  }

  update(event, data) {
    switch (event.type) {
      case 'MILESTONE_ACHIEVED':
        this.awardMilestoneBadge(event.userId, event.milestone);
        break;
      
      case 'ASSIGNMENT_COMPLETED':
        this.checkAssignmentBadges(event.userId, event.score);
        break;
      
      case 'USER_ENROLLED':
        this.awardWelcomeBadge(event.userId);
        break;
    }
  }

  awardMilestoneBadge(userId, milestone) {
    const badgeName = `${milestone}% Complete`;
    this.awardBadge(userId, badgeName);
  }

  checkAssignmentBadges(userId, score) {
    if (score >= 95) {
      this.awardBadge(userId, 'Perfect Score');
    } else if (score >= 80) {
      this.awardBadge(userId, 'High Achiever');
    }
  }

  awardWelcomeBadge(userId) {
    this.awardBadge(userId, 'Welcome Aboard');
  }

  awardBadge(userId, badgeName) {
    if (!this.userBadges.has(userId)) {
      this.userBadges.set(userId, []);
    }
    
    const userBadges = this.userBadges.get(userId);
    if (!userBadges.includes(badgeName)) {
      userBadges.push(badgeName);
      console.log(`🏆 Badge Awarded: User ${userId} earned "${badgeName}" badge`);
    }
  }

  getUserBadges(userId) {
    return this.userBadges.get(userId) || [];
  }
}

class LeaderboardObserver extends Observer {
  constructor() {
    super();
    this.leaderboard = new Map();
  }

  update(event, data) {
    switch (event.type) {
      case 'PROGRESS_UPDATED':
        this.updateUserScore(event.userId, event.newProgress.progress);
        break;
      
      case 'ASSIGNMENT_COMPLETED':
        this.updateUserScore(event.userId, event.score * 0.1); // 10% of score as points
        break;
    }
  }

  updateUserScore(userId, points) {
    const currentScore = this.leaderboard.get(userId) || 0;
    const newScore = currentScore + points;
    this.leaderboard.set(userId, newScore);
    console.log(`🏅 Leaderboard: User ${userId} score updated to ${newScore.toFixed(1)} points`);
  }

  getTopUsers(limit = 10) {
    return Array.from(this.leaderboard.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([userId, score]) => ({ userId, score }));
  }
}

// Usage example
function demonstrateObserver() {
  console.log('=== Observer Pattern Demo ===\n');

  // Create the subject (learning progress tracker)
  const progressTracker = new LearningProgressTracker();

  // Create observers
  const emailNotifier = new EmailNotificationObserver();
  const analytics = new AnalyticsObserver();
  const badgeSystem = new BadgeSystemObserver();
  const leaderboard = new LeaderboardObserver();

  // Subscribe observers
  progressTracker.subscribe(emailNotifier);
  progressTracker.subscribe(analytics);
  progressTracker.subscribe(badgeSystem);
  progressTracker.subscribe(leaderboard);

  console.log('\n1. User enrollment:');
  progressTracker.enrollUser('user123', 'javascript-basics');

  console.log('\n2. Progress updates:');
  progressTracker.updateProgress('user123', 'javascript-basics', 30, 120); // 30%, 2 hours
  progressTracker.updateProgress('user123', 'javascript-basics', 60, 240); // 60%, 4 hours

  console.log('\n3. Assignment completion:');
  progressTracker.completeAssignment('user123', 'javascript-basics', 'assignment-1', 95);

  console.log('\n4. More progress (milestone achievement):');
  progressTracker.updateProgress('user123', 'javascript-basics', 75, 300); // 75%, 5 hours
  progressTracker.updateProgress('user123', 'javascript-basics', 100, 360); // 100%, 6 hours

  console.log('\n5. Analytics summary:');
  console.log('Analytics stats:', analytics.getStats());

  console.log('\n6. User badges:');
  console.log('User badges:', badgeSystem.getUserBadges('user123'));

  console.log('\n7. Leaderboard:');
  console.log('Top users:', leaderboard.getTopUsers(5));

  console.log('\n8. Unsubscribing an observer:');
  progressTracker.unsubscribe(emailNotifier);
  progressTracker.updateProgress('user456', 'react-basics', 25, 60);
  
  console.log('\nNotice: Email notifications stopped, but other observers still work');
}

module.exports = {
  Subject,
  Observer,
  LearningProgressTracker,
  EmailNotificationObserver,
  AnalyticsObserver,
  BadgeSystemObserver,
  LeaderboardObserver,
  demonstrateObserver
};