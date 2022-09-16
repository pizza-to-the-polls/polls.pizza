import { h } from "@stencil/core";

const TweetContainer = () => (
  <div class="tweet-wrapper">
    <img src="/images/tweet.png" />
  </div>
);

const Tweets = () => (
  <div class="tweets">
    <h3 class="has-text-red">🗣 What pizza fans are saying</h3>
    <div class="tweets-wrapper">
      {Array(4)
        .fill(0)
        .map(_ => (
          <TweetContainer />
        ))}
    </div>
  </div>
);

export default Tweets;
