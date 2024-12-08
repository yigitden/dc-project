<template>
  <div
    class="relative w-full"
    @keydown.ctrl.a.prevent="selectAll"
    tabindex="0"
  >
    <div class="flex flex-wrap items-center w-full px-4 py-2 space-x-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent">
      <div 
        v-for="(item, index) in selectedItems" 
        :key="index"
        class="flex items-center px-2 py-1 my-1 text-sm bg-indigo-100 rounded-md"
      >
        <span>{{ item }}</span>
        <button 
          @click="removeItem(index)"
          class="ml-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <input
        ref="searchInput"
        type="text"
        v-model="searchQuery"
        @input="handleSearch"
        @keydown.down.prevent="navigateResults('down')"
        @keydown.up.prevent="navigateResults('up')"
        @keydown.enter.prevent="handleEnter"
        placeholder="Search..."
        class="flex-1 min-w-[100px] outline-none"
      />
    </div>

    <div 
      v-if="showResults" 
      class="absolute w-full mt-1 overflow-hidden bg-white border border-gray-300 rounded-md shadow-lg"
    >
      <div 
        v-if="searchResults.length > 1"
        class="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-b border-gray-200"
      >
        Press Ctrl + A to select all items
      </div>
      <div
        v-for="(result, index) in searchResults"
        :key="result.text"
        @click="selectResult(result)"
        :class="[
          'px-4 py-2 cursor-pointer transition-colors',
          index === currentActiveIndex ? 'bg-indigo-50' : 'hover:bg-gray-100'
        ]"
      >
        <span>{{ result.text }}</span>
        <span 
          v-if="result.isNew" 
          class="ml-2 text-sm text-gray-500"
        >(new value)</span>
      </div>
      <div
        v-if="searchQuery && !hasExactMatch"
        @click="addNewValue(searchQuery)"
        :class="[
          'px-4 py-2 cursor-pointer transition-colors border-t border-gray-200',
          currentActiveIndex === searchResults.length ? 'bg-indigo-50' : 'hover:bg-gray-100'
        ]"
      >
        <span>Add "{{ searchQuery }}" as new value</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const searchQuery = ref('')
const searchResults = ref([])
const activeIndex = ref(0)
const selectedItems = ref([])
const searchInput = ref(null)

const currentActiveIndex = computed(() => {
  if (searchResults.value.length > 0 || (searchQuery.value && !hasExactMatch.value)) {
    return activeIndex.value
  }
  return -1
})

const hasExactMatch = computed(() => {
  return searchResults.value.some(result => 
    result.text.toLowerCase() === searchQuery.value.toLowerCase()
  )
})

const showResults = computed(() => {
  return (searchResults.value.length > 0 || searchQuery.value) && searchQuery.value.trim() !== ''
})

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    activeIndex.value = 0
    return
  }
  searchResults.value = store.getters.searchWords(searchQuery.value)
  activeIndex.value = 0
}

const navigateResults = (direction) => {
  const maxIndex = searchResults.value.length + (hasExactMatch.value ? 0 : 1) - 1

  if (direction === 'down') {
    activeIndex.value = activeIndex.value < maxIndex ? activeIndex.value + 1 : 0
  } else {
    activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : maxIndex
  }
}

const selectAll = () => {
  if (searchResults.value.length > 0 && showResults.value) {
    searchResults.value.forEach(result => {
      if (!selectedItems.value.includes(result.text)) {
        store.dispatch('addToHistory', result.text)
        selectedItems.value.push(result.text)
      }
    })
    searchQuery.value = ''
    searchResults.value = []
    activeIndex.value = -1
    searchInput.value.focus()
  }
}

const handleEnter = () => {
  if (!searchQuery.value.trim()) return

  if (activeIndex.value === searchResults.value.length) {
    addNewValue(searchQuery.value)
  } else if (activeIndex.value >= 0 && searchResults.value[activeIndex.value]) {
    selectResult(searchResults.value[activeIndex.value])
  } else {
    addNewValue(searchQuery.value)
  }
}

const addNewValue = (value) => {
  const newValue = value.trim()
  if (newValue && !selectedItems.value.includes(newValue)) {
    store.dispatch('addToHistory', newValue)
    selectedItems.value.push(newValue)
    searchQuery.value = ''
    searchResults.value = []
    activeIndex.value = -1
    searchInput.value.focus()
  }
}

const selectResult = (result) => {
  if (!selectedItems.value.includes(result.text)) {
    store.dispatch('addToHistory', result.text)
    selectedItems.value.push(result.text)
    searchQuery.value = ''
    searchResults.value = []
    activeIndex.value = -1
    searchInput.value.focus()
  }
}

const removeItem = (index) => {
  selectedItems.value.splice(index, 1)
}

watch(() => searchResults.value, (newResults) => {
  if (newResults.length > 0) {
    activeIndex.value = 0
  }
})
</script>