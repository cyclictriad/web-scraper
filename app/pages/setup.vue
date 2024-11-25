<template>
  <div class="container mx-auto py-8 px-4 md:px-0">
    <!-- Submit Button -->
    <div class="flex justify-between">
      <h2 class="text-3xl font-semibold mb-6 text-green-300">
        Create Your Course Quiz Setup
        <p :class="[{'text-gray-500 ':!setupState.error.state}, {'text-red-600': setupState.error.state}, 'text-sm']">
          All the fields marked
          <sup class="text-white font-etrabold">*</sup> are are required
        </p>
      </h2>
      <button
        @click="setPreferences"
        class="flex bg-green-300 text-gray-900 py-2 px-4 rounded-md font-semibold hover:bg-green-400 transition ease-in-out duration-300 max-h-[fit-content]"
      >
        <span> Complete Setup </span>
        <img
          src="/icons/Check.svg"
          alt="Upload Icon"
          class="size-6 my-auto ml-3"
        />
      </button>
    </div>

    <form class="space-y-8">
      <div class="bg-gray-900 p-6 rounded-lg shadow-lg space-y-6">
        <!-- Header -->
        <h5 class="text-2xl font-semibold text-green-300">File Location</h5>

        <!-- File Directory Input -->
        <div class="space-y-1">
          <label for="docs-dir" class="block text-lg text-green-300">
            Documents <sup class="text-white font-bold">*</sup>
          </label>
          <input
            v-model="upload.dir"
            type="text"
            name="docs_dir"
            id="docs-dir"
            class="w-full bg-gray-800 border-b border-gray-500 hover:border-green-300 text-white py-2 placeholder-gray-500 outline-none transition duration-150 ease-in-out"
            placeholder="C://Users/Programming"
            required
          />

          <p v-if="setupState.error.messages.dir" class="text-sm text-red-600">Please add a directory path</p>
        </div>

        <!-- Backup Directory Input -->
        <div class="space-y-1">
          <label class="flex items-center text-lg text-green-300">
            <input
              type="checkbox"
              v-model="backup.consent"
              class="mr-2 rounded text-green-400 focus:ring-green-500"
            />
            Backup
            <sup v-if="backup.consent" class="text-white font-bold">*</sup>
          </label>
          <input
            v-if="backup.consent"
            v-model="backup.dir"
            type="text"
            name="backup_dir"
            id="backup-dir"
            class="w-full bg-gray-800 border-b border-gray-500 hover:border-green-300 text-white py-2 placeholder-gray-500 outline-none transition duration-150 ease-in-out"
            placeholder="C://Users/Backup"
            required
          />
        </div>
      </div>

      <!-- Course and Subject Info -->
      <section class="bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 class="text-2xl font-semibold mb-4 text-green-300">
          Course/Subject Info
        </h3>

        <CourseSelection v-model:selection="selection" />
      </section>

      <MetaSettings :meta="upload.meta" />
      <DocumentSettings :document="upload.document" />
    </form>
  </div>
</template>
    
    <script setup>
import { setupState } from '~/store';

const selection = ref({
  courses: {},
  subjects: {},
});
const upload = ref({
  dir: "",
  meta: {},
  document: {},
});

const backup = ref({
  consent: false,
  dir: null,
});

const { data: preferences, status } = await useFetch("/api/preferences");
backup.value = preferences.value.backup;
upload.value.meta = preferences.value.upload.meta;
upload.value.dir = preferences.value.upload.dir;
selection.value.courses = preferences.value.courses;
selection.value.subjects = preferences.value.subjects;

upload.value.document = preferences.value.upload.document;

const setPreferences = async () => {
  try {
    await $fetch("/api/preferences", {
      method: "PATCH",
      body: { ...selection.value, upload: upload.value, backup: backup.value },
    });
    console
    useRouter().push('/upload');
  } catch (error) {
    error = error.data
    if(error.data){
      setupState.value.error.state = true    
      setupState.value.error.messages = error.data.error
     
    }
  }
};
</script>
    