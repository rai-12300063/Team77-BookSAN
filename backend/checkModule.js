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

const checkSpecificModule = async () => {
    try {
        const moduleId = '68db8117a36a4ea005a2b4f0';
        console.log(`🔍 Searching for module: ${moduleId}`);
        
        // Try to find the specific module
        const module = await Module.findById(moduleId);
        
        if (module) {
            console.log('✅ Module found:', {
                id: module._id,
                title: module.title,
                courseId: module.courseId,
                moduleNumber: module.moduleNumber,
                hasContents: !!(module.contents && module.contents.length > 0),
                contentsCount: module.contents?.length || 0,
                estimatedDuration: module.estimatedDuration
            });
            
            if (module.contents && module.contents.length > 0) {
                console.log('\n📚 Contents:');
                module.contents.forEach((content, index) => {
                    console.log(`   ${index + 1}. ${content.title} (${content.type}) - ${content.duration}min`);
                });
            }
        } else {
            console.log('❌ Module not found!');
            
            // Let's check what modules exist for this course
            const courseId = '68db8117a36a4ea005a2b4ed';
            console.log(`\n🔍 Checking modules in course: ${courseId}`);
            
            const modulesInCourse = await Module.find({ courseId }).sort({ moduleNumber: 1 });
            console.log(`📊 Found ${modulesInCourse.length} modules in course:`);
            
            modulesInCourse.forEach((mod, index) => {
                console.log(`   ${index + 1}. ${mod.title} (ID: ${mod._id}) - Module #${mod.moduleNumber}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking module:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔒 Database connection closed');
    }
};

const main = async () => {
    await connectDB();
    await checkSpecificModule();
};

main();