const mongoose = require('mongoose');
const TeamMember = require('../models/TeamMember');
const Service = require('../models/Service');
const Portfolio = require('../models/Portfolio');

class DataSeeder {
  constructor() {
    this.seedData = {
      teamMembers: [
        {
          name: "Fatai Sule snr",
          title: "Founder & CEO",
          bio: "Doctoral Candidate with extensive experience in data analytics and AI solutions. Led data transformation initiatives for Fortune 500 companies and government agencies. Expert in machine learning, cloud architecture, and strategic technology leadership.",
          email: "fsule@kfsquare.com",
          phone: "215-279-2887",
          specialties: ["Strategic Leadership", "AI Strategy", "Cloud Architecture", "Team Building"],
          credentials: ["US Army Veteran", "Software Engineering/Machine Learning/Data Engineering", "10+ Years Experience"],
          experience: "10+ Years",
          category: "leadership",
          department: "management",
          displayOrder: 1,
          isActive: true
        },
        {
          name: "Dr. Sarah Chen",
          title: "Chief Technology Officer",
          bio: "Former Google AI research scientist with deep expertise in machine learning algorithms and distributed systems. Leads our technical strategy and oversees the development of proprietary AI platforms.",
          specialties: ["Machine Learning", "Distributed Systems", "AI Research", "Technical Strategy"],
          credentials: ["PhD Computer Science", "AWS Certified Solutions Architect", "12+ Years Experience"],
          experience: "12+ Years",
          category: "leadership",
          department: "research",
          displayOrder: 2,
          isActive: true
        },
        {
          name: "Michael Rodriguez",
          title: "Chief Data Officer",
          bio: "Data analytics veteran from McKinsey & Company with extensive experience in business intelligence and predictive modeling. Specializes in translating complex data insights into actionable business strategies.",
          specialties: ["Business Intelligence", "Predictive Analytics", "Data Strategy", "Executive Consulting"],
          credentials: ["MS Statistics", "Certified Analytics Professional", "18+ Years Experience"],
          experience: "18+ Years",
          category: "leadership",
          department: "analytics",
          displayOrder: 3,
          isActive: true
        },
        {
          name: "Dr. Emily Johnson",
          title: "Senior Data Scientist",
          bio: "PhD in Machine Learning from Stanford. Expert in neural networks and natural language processing with 50+ published papers.",
          specialties: ["Deep Learning", "NLP", "Computer Vision"],
          category: "core",
          department: "research",
          displayOrder: 4,
          isActive: true
        },
        {
          name: "David Kim",
          title: "Lead ML Engineer",
          bio: "Former Tesla ML engineer specializing in production ML systems and scalable model deployment architectures.",
          specialties: ["MLOps", "Kubernetes", "Model Deployment"],
          category: "core",
          department: "engineering",
          displayOrder: 5,
          isActive: true
        },
        {
          name: "Aisha Patel",
          title: "Data Engineering Lead",
          bio: "AWS-certified architect with expertise in building scalable data infrastructures for Fortune 500 companies.",
          specialties: ["Data Pipelines", "Cloud Architecture", "Real-time Processing"],
          category: "core",
          department: "engineering",
          displayOrder: 6,
          isActive: true
        },
        {
          name: "Nashit Syed",
          title: "Business Intelligence Architect",
          bio: "Former Microsoft BI consultant with expertise in creating compelling data visualizations and executive reporting systems.",
          specialties: ["Tableau", "Power BI", "Executive Dashboards"],
          category: "core",
          department: "analytics",
          displayOrder: 7,
          isActive: true
        }
      ],

      services: [
        {
          name: "Dataset Acquisition",
          shortDescription: "Acquire datasets that align with business needs",
          fullDescription: "Professional data sourcing and acquisition services including market research data, industry benchmarks, and custom dataset creation with quality assurance.",
          category: "foundation",
          icon: "📊",
          features: ["Market research datasets", "Industry-specific data", "Custom data collection", "Data quality assurance"],
          technologies: ["APIs", "Web Scraping", "Database Integration", "Data Validation"],
          availability: "available",
          popularity: 9,
          displayOrder: 1,
          tags: ["data", "acquisition", "sourcing"],
          isActive: true
        },
        {
          name: "Pipeline Architecture",
          shortDescription: "Build, test, and maintain database pipeline architectures",
          fullDescription: "End-to-end data pipeline design and implementation for scalable data processing and automation with cloud-native architectures.",
          category: "foundation",
          icon: "🔗",
          features: ["ETL/ELT pipeline design", "Real-time data processing", "Cloud-native architectures", "Performance optimization"],
          technologies: ["Apache Airflow", "Apache Spark", "AWS", "Docker", "Kubernetes"],
          availability: "available",
          popularity: 8,
          displayOrder: 2,
          tags: ["pipeline", "etl", "architecture"],
          isActive: true
        },
        {
          name: "Algorithm Development",
          shortDescription: "Develop algorithms to transform data into actionable information",
          fullDescription: "Custom algorithm design and implementation for complex data processing and business intelligence with proven accuracy and performance.",
          category: "analytics",
          icon: "🧮",
          features: ["Machine learning algorithms", "Statistical modeling", "Optimization algorithms", "Performance tuning"],
          technologies: ["Python", "R", "TensorFlow", "PyTorch", "Scikit-learn"],
          availability: "available",
          popularity: 10,
          displayOrder: 3,
          tags: ["algorithms", "ml", "ai"],
          isActive: true,
          isFeatured: true
        },
        {
          name: "Predictive Analytics",
          shortDescription: "Custom Predictive Analytics Solutions",
          fullDescription: "Advanced predictive modeling solutions to forecast trends and support strategic decision-making with high accuracy rates.",
          category: "analytics",
          icon: "📈",
          features: ["Time series forecasting", "Risk assessment models", "Customer behavior prediction", "Market trend analysis"],
          technologies: ["Python", "R", "Prophet", "ARIMA", "XGBoost"],
          availability: "available",
          popularity: 9,
          displayOrder: 4,
          tags: ["predictive", "forecasting", "trends"],
          isActive: true
        },
        {
          name: "LLM Integration",
          shortDescription: "LLM Model Training & Deployment",
          fullDescription: "Large Language Model integration, fine-tuning, and deployment for enterprise applications with scalable infrastructure.",
          category: "ai",
          icon: "🤖",
          features: ["Model fine-tuning", "API integration", "Performance optimization", "Scalable deployment"],
          technologies: ["OpenAI", "Hugging Face", "Transformers", "BERT", "GPT"],
          availability: "available",
          popularity: 9,
          displayOrder: 5,
          tags: ["llm", "ai", "nlp"],
          isActive: true
        },
        {
          name: "Data Governance",
          shortDescription: "Ensure compliance with data governance and security policies",
          fullDescription: "Comprehensive data governance frameworks to ensure compliance, security, and quality across your organization with industry standards.",
          category: "governance",
          icon: "🔒",
          features: ["Compliance frameworks", "Data security policies", "Access control systems", "Audit and monitoring"],
          technologies: ["AWS IAM", "Azure AD", "Apache Ranger", "Data Catalogs"],
          availability: "available",
          popularity: 7,
          displayOrder: 6,
          tags: ["governance", "compliance", "security"],
          isActive: true
        }
      ]
    };
  }

  async seedDatabase() {
    try {
      console.log('🌱 Starting database seeding...');
      
      // Clear existing data
      await this.clearDatabase();
      
      // Seed team members
      await this.seedTeamMembers();
      
      // Seed services
      await this.seedServices();
      
      console.log('✅ Database seeding completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  async clearDatabase() {
    console.log('🧹 Clearing existing data...');
    await TeamMember.deleteMany({});
    await Service.deleteMany({});
    await Portfolio.deleteMany({});
    console.log('✅ Database cleared');
  }

  async seedTeamMembers() {
    console.log('👥 Seeding team members...');
    
    for (const memberData of this.seedData.teamMembers) {
      try {
        const member = new TeamMember(memberData);
        await member.save();
        console.log(`✅ Created team member: ${member.name}`);
      } catch (error) {
        console.error(`❌ Error creating team member ${memberData.name}:`, error.message);
      }
    }
    
    console.log(`✅ Seeded ${this.seedData.teamMembers.length} team members`);
  }

  async seedServices() {
    console.log('🛠️  Seeding services...');
    
    for (const serviceData of this.seedData.services) {
      try {
        const service = new Service(serviceData);
        await service.save();
        console.log(`✅ Created service: ${service.name}`);
      } catch (error) {
        console.error(`❌ Error creating service ${serviceData.name}:`, error.message);
      }
    }
    
    console.log(`✅ Seeded ${this.seedData.services.length} services`);
  }

  async getStats() {
    try {
      const stats = {
        teamMembers: await TeamMember.countDocuments(),
        services: await Service.countDocuments(),
        portfolioProjects: await Portfolio.countDocuments()
      };
      
      console.log('📊 Database Statistics:');
      console.log(`   Team Members: ${stats.teamMembers}`);
      console.log(`   Services: ${stats.services}`);
      console.log(`   Portfolio Projects: ${stats.portfolioProjects}`);
      
      return stats;
    } catch (error) {
      console.error('❌ Error fetching database stats:', error);
      return null;
    }
  }
}

module.exports = DataSeeder;
