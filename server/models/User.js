import mongoose from 'mongoose';

const stuviaSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true,
    },
}, { _id: false });

const fontSchema = (r, g, b) => ({
    color: {
        type: String,
        default: `rgb(${r},${g},${b})`,
    },
    size: {
        type: Number,
        default: 12,
    },
    family: {
        type: String,
        default: 'TimesRoman',
    },
    line_height: {
        type: Number,
        default: 15,
    },
});

const hfSchema = (text, color) => ({
    text: {
        type: String,
        default: text
    },
    margin: {
        type: Number,
        min: 0,
        default: 10,
    },
    alignment: {
        type: String,
        default: 'Split',
        enum: ['Right', 'Left', 'Center', 'Split'],
    },
    font: fontSchema(color.r, color.g, color.b),
});

const coverImageSchema = (ref) => new mongoose.Schema({
    url: {
        type: String,
    },
    id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref,
    }
}, { _id: false }); // Disable _id for sub-schema items

const uploadSchema = {
    dir: {
        type: String,
        default: '', // Ensures an empty string instead of undefined
    },
    meta: {
        keywords: {
            type: Number,
            max: 8,
            default: 8,
        },
        streams: {
            type: [String],
            default: () => []
        },
        batch: {
            type: Number,
            min: 0,
            default: 2,
        },
        ai_model: {
            type: String,
            default: 'llama3-8b-8192',
        },
        min_price: {
            type: Number,
            min: 2.5,
            default: 2.5,
        },
        link_book: {
            type: Boolean,
            default: true,
        },
    },
    document: {
        page: {
            style: {
                type: String,
                enum: ['Roman', 'Numeric'],
                default: 'Numeric',
            },
        },
        header: hfSchema('#c | #s;#p', { r: 246, g: 254, b: 250 }),
        footer: hfSchema('#s;#e', { r: 18, g: 0, b: 25 }),
        mark: {
            type: String,
            enum: ['Highlight', 'Circle'],
            default: 'Highlight',
        },
        line_spacing: {
            type: Number,
            enum: [1, 1.5, 2.0],
            default: 1,
        },
        cover_page: {
            consent: {
                type: Boolean,
                default: true,
            },
            images: {
                courses: {
                    type: [coverImageSchema('Course')],
                    default: [] // Default empty array for courses
                },
                subjects: {
                    type: [coverImageSchema('Subject')],
                    default: [] // Default empty array for subjects
                }
            }
        },
        sub_heading: fontSchema(0, 11, 120),
        font: fontSchema(0, 0, 0),
        margin: {
            left: {
                type: Number,
                default: 40,
            },
            right: {
                type: Number,
                default: 40,
            },
            top: {
                type: Number,
                default: 20,
            },
            bottom: {
                type: Number,
                default: 20,
            },
        },
    },
};


// Fixed selection schema - changed from a factory function to a schema definition
const selectionSchema = {
    include: {
        type: Boolean,
        default: true,
    },
    list: {
        type: [String],
        default:[], // Using function to ensure new array instance
    }
};



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    stuvia: {
        type: stuviaSchema,
        required: true,
    },
    // Using the schema definition directly
    courses: selectionSchema,
    subjects: selectionSchema,
    preferences: {
        backup: {
            consent: {
                type: Boolean,
                default: false,
            },
            dir: {
                type: String,
                default: '',
            },
        },
        theme: {
            type: String,
            default: 'Dark',
            enum: ['Light', 'Dark'],
        },
        upload: uploadSchema,
    },
}, { timestamps: true });

userSchema.methods.getFilteredCoursesAndSubjects = async function () {
    try {
        const user = this; // `this` is already the current user instance

        const coursesandSubjects = await $fetch('/api/courses-and-subjects');

        let userCourses = coursesandSubjects.filter(course => user.courses.include ? user.courses.list?.includes(course.name) : !user.courses.list.includes(course.name));

        const userSubjects = userCourses.flatMap(course => course.subjects).filter(subject => user.subjects.include ? user.subjects.list?.includes(subject.name) : !user.subjects.list?.includes(subject.name));
        userCourses = userCourses.map(({ name, keywords }) => ({ name, keywords }))
        return {
            courses: userCourses,
            subjects: userSubjects
        }

    } catch (error) {
        console.error('Error in getFilteredCoursesAndSubjects:', error);
        throw error;
    }
};


export default mongoose.model('User', userSchema);