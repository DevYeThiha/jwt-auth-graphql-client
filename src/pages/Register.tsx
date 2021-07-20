import { useState } from "react";
import { RouteComponentProps } from "react-router";
import {useRegisterMutation} from '../generated/graphql';


const Register: React.FC<RouteComponentProps> = ({history}) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [register] = useRegisterMutation();

    return ( 
        <form onSubmit={async e => {
            e.preventDefault();
            console.log('form submit');
            const response = await register({
                variables: {
                    email,
                    password
                }
            });

            console.log(response);

            history.push('/');
        }}>
            <input value={email} type="email" placeholder="email" onChange={e => {
                setEmail(e.target.value);
            }}/>
            <input value={password} type="password" placeholder="password" onChange={e => {
                setPassword(e.target.value);
            }}/>
            <button type="submit">register</button>
        </form>
     );
}
 
export default Register;