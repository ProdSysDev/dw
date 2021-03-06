import { Module, Action, Mutation } from 'vuex-module-decorators'
import { StoreModule } from '~/store/storeModule'
import { Corporate } from '~/api/Models/Corporates/Corporate'
import { CreateCorporateRequest } from '~/api/Requests/Corporates/CreateCorporateRequest'
import { CreateCorporateUserFullRequest } from '~/api/Requests/Corporates/CreateCorporateUserFullRequest'
import { KYBState } from '~/api/Enums/KYBState'
import { ConsumeCorporateUserInviteRequest } from '~/api/Requests/Corporates/ConsumeCorporateUserInviteRequest'
import { $api } from '~/utils/api'

@Module({
  name: 'corporatesV2',
  stateFactory: true,
  namespaced: true
})
export default class Corporates extends StoreModule {
  isLoading: boolean = false

  isLoadingRegistration: boolean = false

  corporate: Corporate | null = null

  users: any = null

  @Mutation
  SET_IS_LOADING(_isLoading: boolean) {
    this.isLoading = _isLoading
  }

  @Mutation
  SET_IS_LOADING_REGISTRATION(_isLoadingRegistration: boolean) {
    this.isLoadingRegistration = _isLoadingRegistration
  }

  @Mutation
  SET_CORPORATE(_corporate: Corporate) {
    this.corporate = _corporate
  }

  @Mutation
  SET_USERS(_users) {
    this.users = _users
  }

  @Action({ rawError: true })
  register(request: CreateCorporateRequest) {
    this.SET_IS_LOADING(true)

    const req = $api.post('/app/api/corporates/_/create', request)

    req.then((res) => {
      this.SET_CORPORATE(res.data)
      this.SET_IS_LOADING(false)
    })
    req.finally(() => {
      this.SET_IS_LOADING(false)
    })

    return req
  }

  @Action({ rawError: true })
  getCorporateDetails(corporateId) {
    this.SET_IS_LOADING(true)

    const req = $api.post('/app/api/corporates/' + corporateId + '/get', {})

    req.then((res) => {
      this.SET_CORPORATE(res.data)
    })
    req.finally(() => {
      this.SET_IS_LOADING(false)
    })

    return req
  }

  @Action({ rawError: true })
  getUsers(corporateId) {
    this.SET_IS_LOADING(true)

    const req = $api.post('/app/api/corporates/' + corporateId + '/users/get', {})

    req.then((res) => {
      this.SET_USERS(res.data)
    })
    req.finally(() => {
      this.SET_IS_LOADING(false)
    })

    return req
  }

  @Action({ rawError: true })
  getUser(params) {
    this.SET_IS_LOADING(true)

    const req = $api.post('/app/api/corporates/' + params.corporateId + '/users/' + params.userId + '/get', {})

    req.finally(() => {
      this.SET_IS_LOADING(false)
    })

    return req
  }

  @Action({ rawError: true })
  updateUser(request) {
    this.SET_IS_LOADING(true)

    const req = $api.post(
      '/app/api/corporates/' + request.corporateId + '/users/' + request.userId + '/update',
      request.body
    )

    req.finally(() => {
      this.SET_IS_LOADING(false)
    })

    return req
  }

  @Action({ rawError: true })
  addUser(request: CreateCorporateUserFullRequest) {
    this.SET_IS_LOADING(true)

    const req = $api.post('/app/api/corporates/' + request.corporateId + '/users/_/create', request.request)

    req.finally(() => {
      this.SET_IS_LOADING(false)
    })

    return req
  }

  @Action({ rawError: true })
  sendUserInvite(request: { corporateId: string; inviteId: string }) {
    this.SET_IS_LOADING(true)

    const req = $api.post('/app/api/corporates/' + request.corporateId + '/invites/' + request.inviteId + '/send', {})

    req.finally(() => {
      this.SET_IS_LOADING(false)
    })

    return req
  }

  @Action({ rawError: true })
  sendVerificationCodeEmail(request) {
    return $api.post('/app/api/corporates/' + request.corporateId + '/users/email/send_verification_code', request.body)
  }

  @Action({ rawError: true })
  async checkKYB() {
    if (this.corporate === null) {
      const _corpId = this.store.getters['auth/auth'].identity.id
      await this.getCorporateDetails(_corpId)
    }

    const _res = this.corporate!.kyb!.fullCompanyChecksVerified === KYBState.APPROVED

    if (!_res) {
      return Promise.reject(new Error('KYB not approved'))
    } else {
      return Promise.resolve()
    }
  }

  @Action({ rawError: true })
  validateInvite(request) {
    return $api.post('/app/api/corporates/' + request.id + '/invites/validate', request.body)
  }

  @Action({ rawError: true })
  consumeInvite(request: ConsumeCorporateUserInviteRequest) {
    return $api.post('/app/api/auth/invites/' + request.id + '/consume', request.body)
  }

  @Action({ rawError: true })
  startKYB(corporateId) {
    return $api.post('/app/api/corporates/' + corporateId + '/kyb/start', {})
  }

  @Action({ rawError: true })
  sendVerificationCodeMobile(request) {
    return $api.post(
      '/app/api/corporates/' + request.corporateId + '/users/mobile/send_verification_code',
      request.request
    )
  }

  @Action({ rawError: true })
  verifyMobile(request) {
    return $api.post('/app/api/corporates/' + request.corporateId + '/users/mobile/verify', request.request)
  }
}
