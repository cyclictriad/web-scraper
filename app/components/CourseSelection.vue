<template>
  <div class="mb-4 w-full">
    <div
      v-if="state.loading"
      class="flex items-center space-x-2 p-4 bg-gray-800/30 rounded-lg"
    >
      <img src="/icons/Scan.gif" alt="scan gif" class="h-6 aspect-square" />
      <span class="text-green-300">Scanning courses...</span>
    </div>

    <!-- Selection Interface -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Course Selector Card -->
      <div class="bg-gray-800/30 rounded-lg p-6 border border-green-500/10">
        <MultipleSelector
          :availableOptions="availableCourses"
          v-model="selection.courses"
          :label="'Course'"
        />
        <p v-if="setupState.error.messages.courses && !selection.courses.list.length" class="text-sm text-red-600">Select atleast one course</p>

      </div>

      <!-- Subject Selector Card -->
      <div class="bg-gray-800/30 rounded-lg p-6 border border-green-500/10">
        <MultipleSelector
          :availableOptions="availableSubjects"
          v-model="selection.subjects"
          :label="'Subject'"
        />
        <p v-if="setupState.error.messages.subjects && !selection.subjects.list.length" class="text-sm text-red-600">Select atleast one subject</p>

      </div>
    </div>
  </div>
</template>


<script setup>
import { setupState } from '~/store';

// Define props for selection containing courses and subjects
const props = defineProps({
  selection: {
    type: Object,
    required: true,
  },
  limited: {
    type: Boolean,
    default: false,
  },
});

const state = ref({
  loading: false,
  failed: false,
});

const allCoursesAndSubjects = ref([]);

async function getCoursesAndSubjects() {
  state.value.error = false;
  state.value.loading = true;

  try {
    allCoursesAndSubjects.value = await $fetch("/api/courses-and-subjects");
  } catch (error) {
    state.value.error = true;
  }
  state.value.loading = false;
}

const availableCourses = computed(() => {
  const selectedCourses = props.selection.courses;

  return allCoursesAndSubjects.value
    .filter((course) =>
      props.limited ? selectedCourses.list.includes(course.name) : true
    )
    .map(({ name, keywords, subjects }) => ({
      name,
      keywords: [
        ...(keywords||[]),
        ...subjects.flatMap(({ name, keywords }) => [name, ...(keywords||[])]),
      ],
    }));
});

const availableSubjects = computed(() => {
  const selectedSubjects = props.selection.subjects;
  const selectedCourses = props.selection.courses;

  if (props.limited) {
    return allCoursesAndSubjects.value
      .flatMap((course) => course.subjects)
      .filter((subject) => selectedSubjects.list.includes(subject.name));
  } else {
    return allCoursesAndSubjects.value
      .filter((course) =>
        selectedCourses.include
          ? selectedCourses.list.includes(course.name)
          : !selectedCourses.list.includes(course.name)
      )
      .flatMap((course) => course.subjects);
  }
});

onMounted(getCoursesAndSubjects);
</script>

<style scoped>
/* Add your styles here */
</style>
