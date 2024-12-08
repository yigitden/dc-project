import { createStore } from 'vuex'

export default createStore({
  state: {
    searchHistory: [],
    predefinedWords: ['apple', 'banana', 'cherry', 'date', 'elderberry']
  },
  
  mutations: {
    ADD_TO_HISTORY(state, word) {
      if (!state.searchHistory.includes(word)) {
        state.searchHistory.push(word)
      }
    }
  },
  
  actions: {
    addToHistory({ commit }, word) {
      commit('ADD_TO_HISTORY', word)
    }
  },
  
  getters: {
    searchWords: (state) => (keyword) => {
      if (!keyword) return []
      
      const matches = state.predefinedWords.filter(word => 
        word.toLowerCase().includes(keyword.toLowerCase())
      )
      
      return matches.map(word => ({
        text: word,
        isNew: false
      })).concat(
        matches.length === 0 ? [{
          text: keyword,
          isNew: true
        }] : []
      )
    }
  }
}) 