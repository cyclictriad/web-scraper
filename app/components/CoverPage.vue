<!-- CoverPage.vue -->
<template>
  <div class="space-y-6 max-w-4xl">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-200">Customize Cover Page</h1>
      <div class="text-sm text-gray-400">
        {{ totalImages }} / {{ totalRequired }} images added
      </div>
    </div>
    
    <!-- Courses Section -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-300 pl-2 border-l-4 border-green-500">
        Course Images
      </h2>
      <div class="space-y-6">
        <ImageCard 
          v-for="course in courses" 
          :key="course._id" 
          :label="course.name" 
          v-model="course.imageUrl"
          @change="(url) => updateCourseImage(course._id, url)"
        />
      </div>
    </div>

    <!-- Subjects Section -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-300 pl-2 border-l-4 border-blue-500">
        Subject Images
      </h2>
      <div class="space-y-6">
        <ImageCard 
          v-for="subject in subjects" 
          :key="subject._id" 
          :label="subject.name" 
          v-model="subject.imageUrl"
          @change="(url) => updateSubjectImage(subject._id, url)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ImageCard from './ImageCard.vue';

const props = defineProps({
  document: {
    type: Object,
    required: true,
  },
});

const courses = ref([]);
const subjects = ref([]);

// Computed properties for progress tracking
const totalImages = computed(() => {
  return courses.value.filter(c => c.imageUrl).length + 
         subjects.value.filter(s => s.imageUrl).length;
});

const totalRequired = computed(() => {
  return courses.value.length + subjects.value.length;
});

// Fetch courses and subjects from the API
const fetchCoursesAndSubjects = async () => {
  try {
    const response = await $fetch('/api/metrics');
    
    courses.value = response.courses.map((course) => ({
      ...course,
      imageUrl: props.document.cover_page.images.courses.find(
        (img) => img.id === course._id
      )?.url || '',
    }));
    
    subjects.value = response.subjects.map((subject) => ({
      ...subject,
      imageUrl: props.document.cover_page.images.subjects.find(
        (img) => img.id === subject._id
      )?.url || '',
    }));
  } catch (error) {
    console.error('Error fetching courses and subjects:', error);
  }
};

// Update document structure when image URL changes for a course
const updateCourseImage = (courseId, newUrl) => {
  const index = props.document.cover_page.images.courses.findIndex(
    (img) => img.id === courseId
  );
  
  if (index !== -1) {
    props.document.cover_page.images.courses[index].url = newUrl;
  } else {
    props.document.cover_page.images.courses.push({
      id: courseId,
      url: newUrl,
    });
  }
};

// Update document structure when image URL changes for a subject
const updateSubjectImage = (subjectId, newUrl) => {
  console.log(subjectId, newUrl)
  const index = props.document.cover_page.images.subjects.findIndex(
    (img) => img.id === subjectId
  );
  
  if (index !== -1) {
    props.document.cover_page.images.subjects[index].url = newUrl;
  } else {
    props.document.cover_page.images.subjects.push({
      id: subjectId,
      url: newUrl,
    });
  }

// console.log({subjects:props.document.cover_page.images.subjects})
}


onMounted(()=>{
  fetchCoursesAndSubjects()
})


</script>