const mongoose = require("mongoose");
const {
  Tenant,
  User,
  Organization,
  Interviewer,
  Candidate,
  Interview,
  Assessment,
  ReportTemplate,
} = require("../models/schemas");

/**
 * Seed data for development and testing
 */
const seedData = async () => {
  try {
    // Clear existing data (only in development)
    if (process.env.NODE_ENV === "development") {
      await Promise.all([
        Tenant.deleteMany({}),
        User.deleteMany({}),
        Organization.deleteMany({}),
        Interviewer.deleteMany({}),
        Candidate.deleteMany({}),
        Interview.deleteMany({}),
        Assessment.deleteMany({}),
        ReportTemplate.deleteMany({}),
      ]);
    }

    // Create sample tenants
    const tenants = [
      {
        tenantId: "TENANT_001",
        name: "TechCorp Solutions",
        domain: "techcorp",
        subscription: {
          plan: "enterprise",
          status: "active",
          maxUsers: 100,
          maxInterviews: 1000,
        },
        settings: {
          timezone: "America/New_York",
          branding: {
            primaryColor: "#217989",
            secondaryColor: "#22c55e",
          },
        },
      },
      {
        tenantId: "TENANT_002",
        name: "StartupHub Inc",
        domain: "startuphub",
        subscription: {
          plan: "professional",
          status: "active",
          maxUsers: 25,
          maxInterviews: 500,
        },
        settings: {
          timezone: "America/Los_Angeles",
          branding: {
            primaryColor: "#3b82f6",
            secondaryColor: "#10b981",
          },
        },
      },
    ];

    const createdTenants = await Tenant.insertMany(tenants);

    // Create sample users for each tenant
    const users = [];
    for (const tenant of createdTenants) {
      users.push(
        {
          tenantId: tenant.tenantId,
          userId: `USER_${tenant.tenantId}_001`,
          email: `admin@${tenant.domain}.com`,
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          permissions: [
            { module: "dashboard", actions: ["read"] },
            {
              module: "interviews",
              actions: ["create", "read", "update", "delete"],
            },
            {
              module: "reports",
              actions: ["create", "read", "update", "delete", "export"],
            },
            {
              module: "settings",
              actions: ["create", "read", "update", "delete"],
            },
            {
              module: "users",
              actions: ["create", "read", "update", "delete"],
            },
          ],
          profile: {
            department: "Administration",
            title: "System Administrator",
          },
        },
        {
          tenantId: tenant.tenantId,
          userId: `USER_${tenant.tenantId}_002`,
          email: `manager@${tenant.domain}.com`,
          firstName: "Sarah",
          lastName: "Johnson",
          role: "manager",
          permissions: [
            { module: "dashboard", actions: ["read"] },
            { module: "interviews", actions: ["create", "read", "update"] },
            { module: "reports", actions: ["read", "export"] },
          ],
          profile: {
            department: "HR",
            title: "Hiring Manager",
            skills: ["JavaScript", "React", "Node.js"],
            specializations: ["Frontend Development"],
          },
        }
      );
    }

    const createdUsers = await User.insertMany(users);

    // Create sample organizations for each tenant
    const organizations = [];
    for (const tenant of createdTenants) {
      organizations.push({
        tenantId: tenant.tenantId,
        organizationId: `ORG_${tenant.tenantId}_001`,
        name: `${tenant.name} - Client A`,
        type: "client",
        industry: "Technology",
        size: "501-1000",
        contact: {
          primaryContact: {
            name: "John Smith",
            email: "john@clienta.com",
            phone: "+1-555-0123",
            title: "CTO",
          },
        },
        contract: {
          startDate: new Date("2024-01-01"),
          status: "active",
          billingRate: 150,
        },
        metrics: {
          totalInterviews: 25,
          completedInterviews: 20,
          activePositions: 5,
          averageRating: 4.2,
        },
      });
    }

    const createdOrganizations = await Organization.insertMany(organizations);

    // Create sample interviewers for each tenant
    const interviewers = [];
    for (const tenant of createdTenants) {
      interviewers.push(
        {
          tenantId: tenant.tenantId,
          interviewerId: `INTV_${tenant.tenantId}_001`,
          userId: `USER_${tenant.tenantId}_002`,
          name: "Sarah Johnson",
          email: `manager@${tenant.domain}.com`,
          type: "internal",
          skills: ["JavaScript", "React", "Node.js"],
          specializations: ["Frontend Development"],
          availability: {
            status: "available",
            timezone: tenant.settings.timezone,
          },
          metrics: {
            totalInterviews: 45,
            completedInterviews: 42,
            averageRating: 4.7,
            averageFeedbackTime: 2.5,
          },
        },
        {
          tenantId: tenant.tenantId,
          interviewerId: `INTV_${tenant.tenantId}_002`,
          name: "Michael Chen",
          email: "michael.chen@external.com",
          type: "external",
          profile: {
            hourlyRate: 200,
            experience: 8,
          },
          skills: ["Python", "Django", "PostgreSQL"],
          specializations: ["Backend Development"],
          availability: {
            status: "available",
            timezone: "America/Los_Angeles",
          },
          metrics: {
            totalInterviews: 32,
            completedInterviews: 30,
            averageRating: 4.9,
            averageFeedbackTime: 1.8,
          },
        }
      );
    }

    const createdInterviewers = await Interviewer.insertMany(interviewers);

    // Create sample candidates for each tenant
    const candidates = [];
    for (const tenant of createdTenants) {
      candidates.push({
        tenantId: tenant.tenantId,
        candidateId: `CAND_${tenant.tenantId}_001`,
        organizationId: `ORG_${tenant.tenantId}_001`,
        personalInfo: {
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@email.com",
          phone: "+1-555-0101",
          location: {
            city: "New York",
            state: "NY",
            country: "USA",
          },
        },
        professional: {
          currentTitle: "Senior Developer",
          currentCompany: "Tech Solutions Inc",
          experience: 5,
          skills: ["JavaScript", "React", "CSS"],
          expectedSalary: {
            min: 90000,
            max: 120000,
          },
        },
        application: {
          position: "Frontend Developer",
          source: "linkedin",
        },
        pipeline: {
          currentStage: "technical_interview",
          status: "active",
        },
      });
    }

    const createdCandidates = await Candidate.insertMany(candidates);

    // Create sample interviews for each tenant
    const interviews = [];
    for (const tenant of createdTenants) {
      interviews.push({
        tenantId: tenant.tenantId,
        interviewId: `INT_${tenant.tenantId}_001`,
        candidateId: `CAND_${tenant.tenantId}_001`,
        interviewerId: `INTV_${tenant.tenantId}_001`,
        organizationId: `ORG_${tenant.tenantId}_001`,
        scheduling: {
          scheduledDate: new Date("2024-01-15"),
          scheduledTime: "10:00",
          duration: 60,
          timezone: tenant.settings.timezone,
        },
        details: {
          type: "technical",
          position: "Frontend Developer",
          interviewerType: "internal",
        },
        status: "completed",
        feedback: {
          score: 8.5,
          rating: 4.5,
          technicalSkills: { score: 9, notes: "Strong React knowledge" },
          communication: { score: 8, notes: "Clear and articulate" },
          overallFeedback: "Strong technical skills, good communication",
          recommendation: "hire",
          submittedAt: new Date("2024-01-15T12:00:00Z"),
        },
        billing: {
          isBillable: false,
        },
        metrics: {
          actualDuration: 65,
          cycleTime: 5,
          feedbackTime: 2,
        },
      });
    }

    const createdInterviews = await Interview.insertMany(interviews);

    // Create sample assessments for each tenant
    const assessments = [];
    for (const tenant of createdTenants) {
      assessments.push({
        tenantId: tenant.tenantId,
        assessmentId: `ASSESS_${tenant.tenantId}_001`,
        candidateId: `CAND_${tenant.tenantId}_001`,
        template: {
          name: "JavaScript Technical Assessment",
          type: "technical",
          category: "Frontend",
          difficulty: "intermediate",
        },
        assignment: {
          assignedDate: new Date("2024-01-14"),
          dueDate: new Date("2024-01-16"),
          timeLimit: 120,
        },
        submission: {
          startedAt: new Date("2024-01-15T09:00:00Z"),
          submittedAt: new Date("2024-01-15T10:30:00Z"),
          timeSpent: 90,
        },
        results: {
          status: "completed",
          score: 85,
          percentage: 85,
          grade: "B+",
          passed: true,
          feedback: "Good understanding of JavaScript fundamentals",
        },
        skills: ["JavaScript", "React"],
      });
    }

    const createdAssessments = await Assessment.insertMany(assessments);

    // Create sample report templates for each tenant
    const reportTemplates = [];
    const templateTypes = [
      {
        name: "Weekly Interview Summary",
        type: "interview",
        description: "Summary of all interviews conducted in the past week",
      },
      {
        name: "Interviewer Performance Report",
        type: "interviewer",
        description: "Performance metrics for all interviewers",
      },
      {
        name: "Assessment Analytics",
        type: "assessment",
        description: "Analysis of assessment results and trends",
      },
      {
        name: "Candidate Pipeline Report",
        type: "candidate",
        description: "Overview of candidate progress through interview stages",
      },
      {
        name: "Client Performance Dashboard",
        type: "organization",
        description: "Performance metrics by client organization",
      },
    ];

    for (const tenant of createdTenants) {
      templateTypes.forEach((template, index) => {
        reportTemplates.push({
          tenantId: tenant.tenantId,
          templateId: `RPT_${tenant.tenantId}_${String(index + 1).padStart(
            3,
            "0"
          )}`,
          name: template.name,
          description: template.description,
          type: template.type,
          configuration: {
            dataSource: {
              collections: [template.type],
              dateRange: "last30days",
            },
            layout: {
              format: "dashboard",
            },
            scheduling: {
              frequency: "weekly",
            },
          },
          status: "active",
          usage: {
            lastGenerated: new Date("2024-01-15"),
            generationCount: 5,
          },
          createdBy: `USER_${tenant.tenantId}_001`,
        });
      });
    }

    const createdReportTemplates = await ReportTemplate.insertMany(
      reportTemplates
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

module.exports = { seedData };
