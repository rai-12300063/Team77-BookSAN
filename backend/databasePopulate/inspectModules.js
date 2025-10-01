const mongoose = require('mongoose');
const Module = require('./models/Module');

// Set strictQuery to suppress warning
mongoose.set('strictQuery', false);

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://racilarde7678:qTuMNTZmjMcFafoH@cluster0.oiovem3.mongodb.net/olpt?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

const inspectModules = async () => {
    try {
        console.log('🔍 Inspecting all modules...');
        
        const modules = await Module.find({});
        console.log(`📚 Found ${modules.length} total modules`);
        
        console.log('\n📊 Module Content Status:');
        console.log('='.repeat(80));
        
        for (const module of modules) {
            const hasContents = module.contents && module.contents.length > 0;
            const contentCount = hasContents ? module.contents.length : 0;
            const contentTypes = hasContents ? module.contents.map(c => c.type).join(', ') : 'None';
            
            console.log(`\n📝 ${module.title}`);
            console.log(`   ID: ${module._id}`);
            console.log(`   Course: ${module.courseId}`);
            console.log(`   Has Content: ${hasContents ? '✅' : '❌'}`);
            console.log(`   Content Count: ${contentCount}`);
            console.log(`   Content Types: ${contentTypes}`);
            console.log(`   Duration: ${module.estimatedDuration || 'Not set'} min`);
            
            if (hasContents) {
                console.log(`   Content Details:`);
                module.contents.forEach((content, index) => {
                    console.log(`     ${index + 1}. ${content.title} (${content.type}) - ${content.duration}min`);
                });
            }
        }
        
        // Summary
        const modulesWithContent = modules.filter(m => m.contents && m.contents.length > 0).length;
        const modulesWithoutContent = modules.length - modulesWithContent;
        
        console.log('\n📈 SUMMARY:');
        console.log('='.repeat(40));
        console.log(`Total Modules: ${modules.length}`);
        console.log(`With Content: ${modulesWithContent}`);
        console.log(`Without Content: ${modulesWithoutContent}`);
        
        if (modulesWithoutContent > 0) {
            console.log('\n❗ Modules needing content:');
            modules.filter(m => !m.contents || m.contents.length === 0).forEach(m => {
                console.log(`   - ${m.title} (${m._id})`);
            });
        }

    } catch (error) {
        console.error('❌ Error inspecting modules:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔒 Database connection closed');
    }
};

const main = async () => {
    await connectDB();
    await inspectModules();
};

main();