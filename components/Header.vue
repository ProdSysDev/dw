<template>
  <div class="container-fluid px-0 mb-5 pb-5">
    <b-navbar type="light" fixed="top" variant="white" class="navbar-padding-adjust">
      <b-container>
        <b-navbar-brand to="/">
          <img src="/img/logo.svg" width="160" class="d-inline-block align-center" alt="WEAVR">
        </b-navbar-brand>
        <b-collapse id="nav_collapse" is-nav v-if="isLoggedIn">
          <b-navbar-nav class="ml-auto">
            <b-nav-item-dropdown right toggle-class="border-bottom">
              <template slot="button-content">
                <template v-if="isConsumer && consumer">{{ consumer.name }} {{ consumer.surname }}</template>
                <template v-if="isCorporate && corporate">
                  {{ corporate.name }}
                </template>
              </template>
              <b-dropdown-item to="/profile">
                Profile
              </b-dropdown-item>
              <b-dropdown-item to="/users" v-if="isCorporate">
                Users
              </b-dropdown-item>
              <b-dropdown-item @click="doLogout">
                Sign out
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-container>
    </b-navbar>
  </div>
</template>
<script lang="ts">
import { Vue, Component, mixins } from 'nuxt-property-decorator'
import { namespace } from 'vuex-class'

import * as AuthStore from '~/store/modules/Auth'
import * as ConsumersStore from '~/store/modules/Consumers'
import { Consumer } from '~/api/Models/Consumers/Consumer'
import BaseMixin from '~/minixs/BaseMixin'

const Auth = namespace(AuthStore.name)
const Consumers = namespace(ConsumersStore.name)

@Component
export default class Header extends mixins(BaseMixin) {
  @Auth.Action logout

  @Auth.Getter isConsumer!: boolean

  @Auth.Getter isCorporate!: boolean

  @Auth.Getter isLoggedIn!: boolean

  @Auth.Getter identityId!: number | null

  @Consumers.Getter consumer!: Consumer | null

  get corporate() {
    return this.stores.corporates.corporate
  }

  doLogout() {
    this.logout().then(this.redirectToLogin.bind(this))
  }

  redirectToLogin() {
    try {
      this.$segment.reset()
    } catch (e) {
    }
    this.$router.push('/login')
  }

  mounted() {
    if (this.consumer === null && this.corporate === null) {
      const _id = this.identityId
      if (_id) {
        if (this.isConsumer) {
          ConsumersStore.Helpers.get(this.$store, _id)
        } else if (this.isCorporate) {
          this.stores.corporates.getCorporateDetails(_id)
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.dropdown-toggle {
  border-bottom: 2px solid;
}
</style>
