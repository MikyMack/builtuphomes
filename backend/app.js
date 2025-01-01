require('dotenv').config({ path: './backend/.env' });
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cloudinary = require('./config/cloudinary');
const upload = require('./config/multer-config');

// Routes
const authRoutes = require('./routes/authRoutes');

const authMiddleware = require('./middleware/auth');

// Controllers
const authController = require('./controllers/authController');

// Models
const Testimonial = require('./models/Testimonial');
const ClientReview = require('./models/ClientReview');
const Project = require('./models/Project');

const app = express();

// Static files
app.use(express.static(path.join(__dirname, '../assets')));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
    })
);

// Routes setup
app.use('/api/auth', authRoutes);

// Testimonial Routes
// Create new testimonial
app.post('/api/testimonials', upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;
        let profilePicture = '';

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            profilePicture = result.secure_url;
        }

        const testimonial = new Testimonial({
            name,
            description,
            profilePicture,
            listed: true
        });

        await testimonial.save();
        res.status(201).json({ success: true, testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all testimonials
app.get('/api/testimonials', async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle testimonial listing status
app.put('/api/testimonials/:id/toggle-listing', async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }
        testimonial.listed = !testimonial.listed;
        await testimonial.save();
        res.json({ success: true, listed: testimonial.listed });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update testimonial
app.put('/api/testimonials/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;
        let updateData = { name, description };

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.profilePicture = result.secure_url;
        }

        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        res.json(testimonial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete testimonial
app.delete('/api/testimonials/:id', async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }
        res.json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Client Review Routes
// Create new review
app.post('/api/client-reviews', async (req, res) => {
    try {
        const { name, description, rating } = req.body;
        const clientReview = new ClientReview({
            name,
            description,
            rating,
            listed: true
        });
        await clientReview.save();
        res.status(201).json({ success: true, clientReview });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all reviews
app.get('/api/client-reviews', async (req, res) => {
    try {
        const reviews = await ClientReview.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle review listing status
app.put('/api/client-reviews/:id/toggle-listing', async (req, res) => {
    try {
        const review = await ClientReview.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        review.listed = !review.listed;
        await review.save();
        res.json({ success: true, listed: review.listed });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update review
app.put('/api/client-reviews/:id', async (req, res) => {
    try {
        const { name, description, rating } = req.body;
        const updatedReview = await ClientReview.findByIdAndUpdate(
            req.params.id,
            { name, description, rating },
            { new: true }
        );
        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete review
app.delete('/api/client-reviews/:id', async (req, res) => {
    try {
        const review = await ClientReview.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Project Routes
app.post('/create-projects', upload.array('images', 4), async (req, res) => {
    try {
        const { title, description, price } = req.body;
        const imageUrls = [];

        // Upload images to Cloudinary
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path);
            imageUrls.push(result.secure_url);
        }

        const project = new Project({
            title,
            description,
            price,
            images: imageUrls
        });

        await project.save();
        res.status(201).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/projects/:id/toggle-listing', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Toggle the isListed status
        project.listed = !project.listed;
        await project.save();

        res.json({ 
            success: true, 
            message: `Project ${project.listed ? 'listed' : 'unlisted'} successfully`,
            listed: project.listed 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/projects/:id', upload.array('images', 4), async (req, res) => {
    try {
        const { title, description, price } = req.body;
        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path);
                imageUrls.push(result.secure_url);
            }
        }

        const updateData = {
            title,
            description,
            price,
            ...(imageUrls.length > 0 && { images: imageUrls })
        };

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        // Delete images from Cloudinary
        for (const imageUrl of project.images) {
            // Extract public_id from the Cloudinary URL
            const matches = imageUrl.match(/\/project_images\/(.+)\./);
            if (matches && matches[1]) {
                const publicId = `project_images/${matches[1]}`;
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Error deleting image from Cloudinary:', cloudinaryError);
                }
            }
        }
        // Delete the project from the database
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project and associated images deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Home route
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});
app.get('/about', (req, res) => {
    res.render('about', { title: 'About Us' });
});
app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us' });
});
app.get('/blogs', (req, res) => {
    res.render('blog', { title: 'Blogs' });
});
app.get('/projects', (req, res) => {
    res.render('projects', { title: 'Projects' });
});
app.get('/services', (req, res) => {
    res.render('services', { title: 'Services' });
});
app.get('/planning-design', (req, res) => {
    res.render('plananddesign', { title: 'planning and design' });
});
app.get('/interior-design', (req, res) => {
    res.render('interior-design', { title: 'interior and design' });
});
app.get('/landscaping-design', (req, res) => {
    res.render('landscaping-design', { title: 'landscaping and design' });
});
app.get('/maintenance', (req, res) => {
    res.render('maintenance', { title: 'Maintenance' });
});
app.get('/bank-loan', (req, res) => {
    res.render('bank-loan', { title: 'Bank Loans' });
});
app.get('/department-plans', (req, res) => {
    res.render('department-plans', { title: 'Department plans' });
});
app.get('/building-valuation', (req, res) => {
    res.render('building-valuation', { title: 'building-valuation' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Admin Login' }); 
});
app.get('/admin-dashboard', authMiddleware, (req, res) => {
    res.render('admin-dashboard', { title: 'Admin dashboard' }); 
});
app.get('/admin-testinomials', (req, res) => {
    res.render('admin-testinomials', { title: 'admin-testinomials' }); 
});
app.get('/admin-reviews', (req, res) => {
    res.render('admin-reviews', { title: 'admin-reviews' }); 
});

app.get('/logout', authController.logout);

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).send('File size exceeds the limit of 5 MB');
        }
    } else if (err.message === 'Only image files are allowed!') {
        return res.status(400).send('Only image files are allowed!');
    }
    next(err);
});

module.exports = app;
