import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.jobLog.deleteMany();
  await prisma.job.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.agent.deleteMany();

  // Create sample agents
  const agent1 = await prisma.agent.create({
    data: {
      name: 'GPT-4 Analyzer',
      description: 'Analyzes data and generates insights using GPT-4',
      model: 'gpt-4',
      tools: {
        textAnalysis: true,
        summarization: true,
        extraction: true,
      },
      config: {
        temperature: 0.7,
        maxTokens: 2000,
      },
    },
  });

  const agent2 = await prisma.agent.create({
    data: {
      name: 'Claude Sonnet Researcher',
      description: 'Conducts research and compiles reports using Claude',
      model: 'claude-sonnet-4',
      tools: {
        webSearch: true,
        documentAnalysis: true,
        reporting: true,
      },
      config: {
        temperature: 0.5,
        maxTokens: 4096,
      },
    },
  });

  const agent3 = await prisma.agent.create({
    data: {
      name: 'Code Assistant',
      description: 'Helps with code review and generation',
      model: 'gpt-4-turbo',
      tools: {
        codeReview: true,
        codeGeneration: true,
        debugging: true,
      },
      config: {
        temperature: 0.3,
        maxTokens: 3000,
      },
    },
  });

  console.log(`✅ Created ${3} agents`);

  // Create sample workflows
  const workflow1 = await prisma.workflow.create({
    data: {
      name: 'Data Analysis Pipeline',
      description: 'Analyzes incoming data and generates a comprehensive report',
      definition: {
        steps: [
          {
            id: 'analyze',
            agentId: agent1.id,
            action: 'analyzeData',
            description: 'Analyze the input data',
          },
          {
            id: 'research',
            agentId: agent2.id,
            action: 'researchContext',
            description: 'Research additional context',
            dependsOn: ['analyze'],
          },
          {
            id: 'report',
            agentId: agent2.id,
            action: 'generateReport',
            description: 'Generate final report',
            dependsOn: ['analyze', 'research'],
          },
        ],
        config: {
          parallelExecution: false,
          timeout: 300000,
        },
      },
    },
  });

  const workflow2 = await prisma.workflow.create({
    data: {
      name: 'Code Review Workflow',
      description: 'Reviews code changes and provides feedback',
      definition: {
        steps: [
          {
            id: 'review',
            agentId: agent3.id,
            action: 'reviewCode',
            description: 'Review the code changes',
          },
          {
            id: 'suggest',
            agentId: agent3.id,
            action: 'suggestImprovements',
            description: 'Suggest improvements',
            dependsOn: ['review'],
          },
        ],
        config: {
          parallelExecution: false,
          timeout: 180000,
        },
      },
    },
  });

  const workflow3 = await prisma.workflow.create({
    data: {
      name: 'Simple Echo Workflow',
      description: 'A simple workflow that echoes the input (for testing)',
      definition: {
        steps: [
          {
            id: 'echo',
            agentId: agent1.id,
            action: 'echo',
            description: 'Echo the input data',
          },
        ],
        config: {
          parallelExecution: false,
          timeout: 60000,
        },
      },
    },
  });

  console.log(`✅ Created ${3} workflows`);

  // Create a sample completed job
  const job1 = await prisma.job.create({
    data: {
      workflowId: workflow3.id,
      status: 'succeeded',
      input: {
        message: 'Hello, AI Exec OS!',
        timestamp: new Date().toISOString(),
      },
      output: {
        message: 'Echo: Hello, AI Exec OS!',
        processedAt: new Date().toISOString(),
        executionTime: 1250,
      },
    },
  });

  await prisma.jobLog.createMany({
    data: [
      {
        jobId: job1.id,
        level: 'info',
        message: 'Job execution started',
        meta: { timestamp: new Date().toISOString() },
      },
      {
        jobId: job1.id,
        level: 'info',
        message: 'Executing workflow: Simple Echo Workflow',
        meta: { workflowId: workflow3.id },
      },
      {
        jobId: job1.id,
        level: 'info',
        message: 'Job execution completed successfully',
        meta: { duration: 1250 },
      },
    ],
  });

  console.log(`✅ Created ${1} sample job with logs`);

  console.log('\n📊 Summary:');
  console.log(`   Agents: ${await prisma.agent.count()}`);
  console.log(`   Workflows: ${await prisma.workflow.count()}`);
  console.log(`   Jobs: ${await prisma.job.count()}`);
  console.log(`   Job Logs: ${await prisma.jobLog.count()}`);
  console.log('\n✨ Seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
