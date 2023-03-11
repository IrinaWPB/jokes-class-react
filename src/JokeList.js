import React from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";


class JokeList extends React.Component {
  static defaultProps = {
    numJokes: 10
  };

  state = {
    jokes: []
  }

  getJokes = async () => {
    let j = this.state.jokes;
    //getting "votes" value
    let votes = JSON.parse(window.localStorage.getItem("votes") || '{}')
    //no repeating jokes
    let seenJokes = new Set(j.map(j => j.id));
    try {
      //getting 10 different jokes
      while (j.length < this.props.numJokes) {
        const res = await axios.get("https://icanhazdadjoke.com", {
                  headers: { Accept: "application/json" }
                });
        //making a new joke object
        let { status, ...jokeObj } = res.data 
        //if the joke is not on the list yet - adding, 
        //also adding "votes" property
        if (!seenJokes.has(jokeObj.id)) {
          seenJokes.add(jokeObj.id);
          votes[jokeObj.id] = votes[jokeObj.id] || 0
          j.push({ ...jokeObj, votes: votes[jokeObj.id]});
        } else {
          console.error("duplicate found!");
        }
      }
      //updating the state
      this.setState({ j });
      window.localStorage.setItem("votes", JSON.stringify(votes))
    } catch (e) {
      console.log(e);
    }
  }

  getNewJokes = () => {
    this.setState(state => ({jokes : state.jokes.filter(joke => joke.locked)}))
  }

  vote = (id, upOrDown) => {
    //get votes from local Storage
    let votes = JSON.parse(window.localStorage.getItem('votes'))
    //find current votes for the joke by id and increment/decrement value
    votes[id] = (votes[id] || 0) + upOrDown
    //update local storage
    window.localStorage.setItem("votes", JSON.stringify(votes))

    //now updating state
    this.setState(state=>({
      jokes: state.jokes.map(j=> j.id === id ? { ...j, votes: j.votes + upOrDown } : j)
    }))
  }
  
  componentDidMount() {
    //called when component mounts
    if (this.state.jokes.length < this.props.numJokes) this.getJokes()
  }

  componentDidUpdate() {
    //called when "getNewJokes" changing the state
    if (this.state.jokes.length < this.props.numJokes) this.getJokes()
  }
  
  render() {
    let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);
    return (
       <div className="JokeList">
        <button
          className="JokeList-getmore"
          onClick={this.getNewJokes}
        >
          Get New Jokes
        </button>
        {sortedJokes.map(j=>(<Joke key={j.id} joke={j} vote={this.vote}/>))}
      </div>
    )
  }
}

export default JokeList
// function JokeList({ numJokesToGet = 10 }) {
//   const [jokes, setJokes] = useState([]);

//   /* get jokes if there are no jokes */

//   useEffect(function() {
//     async function getJokes() {
//       let j = [...jokes];
//       let seenJokes = new Set();
//       try {
//         while (j.length < numJokesToGet) {
//           let res = await axios.get("https://icanhazdadjoke.com", {
//             headers: { Accept: "application/json" }
//           });
//           let { status, ...jokeObj } = res.data;
  
//           if (!seenJokes.has(jokeObj.id)) {
//             seenJokes.add(jokeObj.id);
//             j.push({ ...jokeObj, votes: 0 });
//           } else {
//             console.error("duplicate found!");
//           }
//         }
//         setJokes(j);
//       } catch (e) {
//         console.log(e);
//       }
//     }

//     if (jokes.length === 0) getJokes();
//   }, [jokes, numJokesToGet]);

//   /* empty joke list and then call getJokes */

//   function generateNewJokes() {
//     setJokes([]);
//   }

//   /* change vote for this id by delta (+1 or -1) */

//   function vote(id, delta) {
//     setJokes(allJokes =>
//       allJokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j))
//     );
//   }

//   /* render: either loading spinner or list of sorted jokes. */

//   if (jokes.length) {
//     let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
  
//     return (
//       <div className="JokeList">
//         <button className="JokeList-getmore" onClick={generateNewJokes}>
//           Get New Jokes
//         </button>
  
//         {sortedJokes.map(j => (
//           <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={vote} />
//         ))}
//       </div>
//     );
//   }

//   return null;

// }


