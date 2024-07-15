const ProgressIndicator = ({ done, inReview, annotating, total }) => {
  // Calculate percentages
  const donePercent = Math.floor((done / total) * 100);
  const inReviewPercent = Math.floor((inReview / total) * 100);
  const annotatingPercent = Math.floor((annotating / total) * 100);
  console.log(
    done,
    inReview,
    annotating,
    total,
    donePercent,
    inReviewPercent,
    annotatingPercent
  );
  return (
    <div className="w-full h-1.5 mt-1 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-green-500"
        style={{ width: `${donePercent}%` }}
      ></div>
      <div
        className="h-full bg-yellow-500"
        style={{ width: `${inReviewPercent}%` }}
      ></div>
      <div
        className="h-full bg-gray-500"
        style={{ width: `${annotatingPercent}%` }}
      ></div>
    </div>
  );
};

export default ProgressIndicator;
