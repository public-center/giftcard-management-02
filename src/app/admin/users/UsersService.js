const Resource = new WeakMap();
const filter = new WeakMap();

/**
 * Admin users service
 */
export class AdminUsersService {
  constructor(GcResource, $filter) {
    'ngInject';
    filter.set(this, $filter);
    // Hold reference to retrieved users
    this.displayData = {
      users: [],
      selectedUser: {}
    };
    Resource.set(this, GcResource);
  }

  /**
   * Retrieve users
   */
  getUsers() {
    // Reinitialize array
    this.displayData.users = [];
    // Retrieve users
    return Resource.get(this).resource('Admin:users')
      .then((res) => {
        for (let user of res) {
          user.created = filter.get(this)('date')(user.created);
          if (user.store) {
            user.storeName = user.store.name;
          }
          if (user.company) {
            user.companyName = user.company.name;
          }
          this.displayData.users.push(user);
        }
      })
  }

  /**
   * Change a user's role
   * @param user
   */
  updateRole(user) {
    let role;
    switch (user.role) {
      case 'admin':
        role = 'buyer';
        break;
      case 'buyer':
        role = 'supplier';
        break;
      case 'supplier':
        role = 'admin';
        break;
    }
    return Resource.get(this).resource('Admin:changeRole', {
      user: user,
      role: role
    })
    .then(() => {
      this.displayData.users = this.displayData.users.map((thisUser) => {
        // Update role
        if (thisUser._id === user._id) {
          thisUser.role = role;
        }
        return thisUser;
      });
      return role;
    });
  }
}
