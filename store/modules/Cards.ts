import { GetterTree, MutationTree } from 'vuex'
import { RootState } from 'store'
import * as Loader from './Loader'
import { api } from '~/api/Axios'
import { Actions, State, types } from '~/store/modules/Contracts/Cards'
import { ManagedCardsSchemas } from '~/api/ManagedCardsSchemas'

export const name = 'cards'

export const namespaced = true

export const state = (): State => ({
  isLoading: false,
  cards: [],
  statement: null,
  managedCard: null
})

export const getters: GetterTree<State, RootState> = {
  cards: (state) => {
    return state.cards
  },
  totalAvailableBalance: (state) => {
    if (state.cards == null) {
      return 0
    }

    let total = 0

    state.cards.forEach((card: ManagedCardsSchemas.ManagedCard) => {
      if (card.balances.availableBalance) {
        if (card.currency === 'GBP') {
          total = total + parseInt(card.balances.availableBalance) * 1.16
        } else {
          total += parseInt(card.balances.availableBalance)
        }
      }
    })

    return total
  },
  isLoading: (state) => {
    return state.isLoading
  },
  statement: (state) => {
    return state.statement
  },
  filteredStatement: (state) => {
    if (state.statement == null) {
      return []
    }

    return state.statement.entry.filter((element) => {
      // @ts-ignore
      return element.adjustment != 0
    })
  },
  managedCard: (state) => {
    return state.managedCard
  }
}

export const actions: Actions<State, RootState> = {
  getCards({ commit }) {
    commit(Loader.name + '/' + Loader.types.START, null, { root: true })

    const body = {
      paging: {
        count: true,
        offset: 0,
        limit: 0
      }
    }

    const req = api.post('/app/api/managed_cards/get', body)

    req.then((res) => {
      commit(types.SET_CARDS, res.data.card)
    })
    req.finally(() => {
      commit(Loader.name + '/' + Loader.types.STOP, null, { root: true })
    })

    return req
  },
  addCard({ commit }, request: ManagedCardsSchemas.CreateManagedCardRequest) {
    commit(Loader.name + '/' + Loader.types.START, null, { root: true })

    const req = api.post('/app/api/managed_cards/_/create', request)

    req.finally(() => {
      commit(Loader.name + '/' + Loader.types.STOP, null, { root: true })
      commit(types.SET_IS_LOADING, false)
    })

    return req
  },
  getCardStatement({ commit }, request) {
    commit(types.SET_IS_LOADING, true)
    commit(Loader.name + '/' + Loader.types.START, null, { root: true })

    const req = api.post(
      '/app/api/managed_cards/' + request.id + '/statement/get',
      request
    )

    req.then((res) => {
      commit(types.SET_STATEMENT, res.data)
    })

    req.finally(() => {
      commit(Loader.name + '/' + Loader.types.STOP, null, { root: true })
      commit(types.SET_IS_LOADING, false)
    })

    return req
  },
  getManagedCard({ commit }, id) {
    const req = api.post('/app/api/managed_cards/' + id + '/get', {})

    req.then((res) => {
      commit(types.SET_MANAGED_CARD, res.data)
    })

    return req
  },
  destroyManagedCard({}, request) {
    return api.post(
      '/app/api/managed_cards/' + request.id + '/destroy',
      request.body
    )
  }
}

export const mutations: MutationTree<State> = {
  [types.SET_CARDS](state, cards) {
    state.cards = cards
  },
  [types.SET_IS_LOADING](state, isLoading: boolean) {
    state.isLoading = isLoading
  },
  [types.SET_STATEMENT](state, r: ManagedCardsSchemas.ManagedCardStatement) {
    state.statement = r
  },
  [types.SET_MANAGED_CARD](state, r: ManagedCardsSchemas.ManagedCard) {
    state.managedCard = r
  }
}