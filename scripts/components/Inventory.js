/*
 Inventory
 <Inventory/>
 */

import React from 'react';
import AddFishForm from './AddFishForm';
import autobind from 'autobind-decorator';
import Firebase from 'firebase';
const ref = new Firebase('https://torrid-torch-3572.firebaseio.com');

@autobind
class Inventory extends React.Component {

    constructor() {
        super();

        this.state = {
            uid: ''
        }
    }

    authenticate(provider){
        console.log("Trying to auth with " + provider);
        ref.authWithOAuthPopup(provider, this.authHandler);
    }

    componentWillMount(){
        var token = localStorage.getItem('token');
        if(token){
            ref.authWithCustomToken(token, this.authHandler);
        }
    }

    logout(){
        ref.unauth();
        localStorage.removeItem('token');
        this.setState({
            uid:null
        });
    }
    authHandler(err, authData){
        if(err){
            console.err(err);
        }

        //save login token in browser
        localStorage.setItem('token', authData.token);

        const storeRef = ref.child(this.props.params.storeId);
        storeRef.on('value', (snapshot)=> {
            var data = snapshot.val() || {};
            if(!data.owner){
                storeRef.set({
                   owner: authData.uid
                });
            }
            this.setState({
                uid: authData.uid,
                owner: data.owner || authData.uid
            });
        });
    }
    renderLogin() {
        return (
            <nav className="login">
                <h2>Inventory</h2>
                <p>Sign in to manage your store's inventory</p>
                <button className="github" onClick={this.authenticate.bind(this, 'github')}>Login with Github</button>
                <button className="facebook" onClick={this.authenticate.bind(this, 'facebook')}>Login with Facebook</button>
                <button className="twitter" onClick={this.authenticate.bind(this, 'twitter')}>Login with Twitter</button>
            </nav>
        )
    }

    renderInventory(key) {
        var linkState = this.props.linkState;
        return (
            <div className="fish-edit" key={key}>
                <input type="text" valueLink={linkState('fishes.'+ key +'.name')}/>
                <input type="text" valueLink={linkState('fishes.'+ key +'.price')}/>
                <select valueLink={linkState('fishes.' + key + '.status')}>
                    <option value="unavailable">Sold Out!</option>
                    <option value="available">Fresh!</option>
                </select>

                <textarea valueLink={linkState('fishes.' + key + '.desc')}></textarea>
                <input type="text" valueLink={linkState('fishes.'+ key +'.image')}/>
                <button onClick={this.props.removeFish.bind(null, key)}>Remove Fish</button>

            </div>
        )
    }

    render() {

        let logoutButton = <button onClick={this.logout}>Log Out</button>;
        // check if are not logged in
        if (!this.state.uid) {
            return (
                <div>{this.renderLogin()}</div>
            )
        }

        //check if owner of current store
        if (this.state.uid !== this.state.owner) {
            return (
                <div>Sorry you aren't the owner of this store
                {logoutButton}
                </div>
            )
        }

        return (
            <div>
                <h2>Inventory</h2>
                {logoutButton}
                {Object.keys(this.props.fishes).map(this.renderInventory)}

                <AddFishForm {...this.props} />
                <button onClick={this.props.loadSamples}>Load Sample Fishes</button>

            </div>
        )
    }
}
;

Inventory.propTypes = {
    addFish: React.PropTypes.func.isRequired,
    loadSamples: React.PropTypes.func.isRequired,
    fishes: React.PropTypes.object.isRequired,
    linkState: React.PropTypes.func.isRequired,
    removeFish: React.PropTypes.func.isRequired
}

export default Inventory;
