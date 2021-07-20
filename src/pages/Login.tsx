import { useState } from "react";
import { RouteComponentProps } from "react-router";
import { setAccessToken } from "../accessToken";
import {MeDocument, MeQuery, useLoginMutation} from '../generated/graphql';


const Login: React.FC<RouteComponentProps> = ({history}) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [Login] = useLoginMutation();

    return ( 
        <form onSubmit={async e => {
            e.preventDefault();
            console.log('form submit');
            const response = await Login({
                variables: {
                    email,
                    password
                },
                update: (store, {data}) => {
                    if(!data) {
                        return null
                    }
                    store.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: {
                            __typename: "Query",
                            me: data.login.user
                        }
                    });
                   
                }
            });

            console.log(response);

            if(response && response.data){
               setAccessToken(response.data.login.accessToken);
            }
            

            history.push('/');
        }}>
            <input value={email} type="email" placeholder="email" onChange={e => {
                setEmail(e.target.value);
            }}/>
            <input value={password} type="password" placeholder="password" onChange={e => {
                setPassword(e.target.value);
            }}/>
            <button type="submit">Login</button>
        </form>
     );
}
 
export default Login;