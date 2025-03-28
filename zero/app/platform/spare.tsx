{[...Array(9)].map((_, index) => (
    <div key={index} className="bg-white shadow-md p-4 place-items-center hover:bg-gray-100">
      <p className="text-left">CATEGORY/TOPIC</p>
      <img src="https://nextgroup.or.kr/api/boards/3/posts/505/files/board-thumbnail/1" />
      <h2 className="font-semibold text-xl mt-2">Zeronote Post {index + 1}</h2>
      <p className="text-gray-600">This is a brief description of the post</p>
    </div>
  ))}