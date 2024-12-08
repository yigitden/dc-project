<template>
  <div class="relative w-full max-w-sm">
    <input
      type="text"
      v-model="searchQuery"
      @input="handleSearch"
      placeholder="Search..."
      class="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
    />
    
    <div 
      v-if="searchResults.length > 0" 
      class="absolute w-full mt-1 overflow-hidden bg-white border border-gray-300 rounded-md shadow-lg"
    >
      <div
        v-for="result in searchResults"
        :key="result.text"
        @click="selectResult(result)"
        class="px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <span>{{ result.text }}</span>
        <span 
          v-if="result.isNew" 
          class="ml-2 text-sm text-gray-500"
        >(new value)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const searchQuery = ref('')
const searchResults = ref([])

const handleSearch = () => {
  searchResults.value = store.getters.searchWords(searchQuery.value)
}

const selectResult = (result) => {
  store.dispatch('addToHistory', result.text)
  searchQuery.value = result.text
  searchResults.value = []
}
</script> 