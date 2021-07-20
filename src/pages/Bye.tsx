import {useByeQuery} from '../generated/graphql';
export interface ByeProps {
    
}
 
const Bye: React.FC<ByeProps> = () => {
    const {data, loading, error} = useByeQuery({
        fetchPolicy: "network-only"
    });

    if(loading){
        return <div>loading...</div>
    }

    if(error){
        console.log(error);
        return <div>Error</div>
    }

    if(!data){
        return <div>no data</div>
    }
    // console.log(data);
    return ( 
    <div>
        {data.bye}
    </div> 
    );
}
 
export default Bye;