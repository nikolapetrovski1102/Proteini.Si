export default function LoyaltyPoints() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Loyalty Points Program</h2>
      <p className="text-gray-600 mb-4">
        Earn points with every purchase and redeem them for discounts!
      </p>
      <ul className="list-disc pl-5 space-y-2 text-gray-600">
        <li>Earn 2 points for every 1 MKD spent</li>
        <li>1000 points = 100 MKD discount</li>
        <li>Points never expire for active members</li>
        <li>Special bonus points on featured products</li>
      </ul>
    </div>
  );
}
