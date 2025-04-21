import pool from "../connections/db.cjs";


// ✅ Add a Review
export const submitReview = async (req, res) => {
    const { id } = req.params;
    const { user_id, rating, comment } = req.body;
    console.log("review body:", req.body)
  
    try {
      // Validate input
      if (!user_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Invalid review data" });
      }
  
      // Insert review into the database
      await pool.query(
        `
        INSERT INTO reviews (user_id, hostel_id, rating, comment, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        `,
        [user_id, id, rating, comment]
      );
  
      res.status(201).json({ message: "Review submitted successfully" });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ error: "Failed to submit review" });
    }
  };

// ✅ Get All Reviews for a Hostel (With Pagination)
export const getHostelReviews = async (req, res) => {
    const { hostel_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const result = await pool.query(
            "SELECT r.*, u.first_name || ' ' || u.last_name AS reviewer_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.hostel_id = $1 ORDER BY r.created_at DESC LIMIT $2 OFFSET $3",
            [hostel_id, limit, offset]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews", error });
    }
};

// ✅ Delete a Review (Only by the Reviewer)
export const deleteReview = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const result = await pool.query("DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *", [id, user_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Review not found or unauthorized" });
        }

        // Update average rating after review deletion
        await pool.query(`
            UPDATE hostels 
            SET average_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE hostel_id = $1), 0)
            WHERE id = $1`,
            [result.rows[0].hostel_id]
        );

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting review", error });
    }
};


export const getReviewSummary = async (req, res) => {
    const { id } = req.params;
    try {
      // Fetch average rating and total reviews
      const summaryResult = await pool.query(
        `
        SELECT 
          AVG(rating) AS average_rating,
          COUNT(*) AS total_reviews
        FROM reviews
        WHERE hostel_id = $1
        `,
        [id]
      );

      const summary = summaryResult.rows[0]
  
      // Fetch rating breakdown
      const breakdownResult = await pool.query(
        `
        SELECT rating, COUNT(*) AS count
        FROM reviews
        WHERE hostel_id = $1
        GROUP BY rating
        ORDER BY rating DESC
        `,
        [id]
      );
  
      const ratingBreakdown = {};
      breakdownResult.rows.forEach((row) => {
        ratingBreakdown[row.rating] = row.count;
      });

     // const breakdown = breakdownResult.rows[0]
  
      // Fetch recent reviews
      const recentReviewsResults = await pool.query(
        `
        SELECT id, user_id, rating, comment, created_at
        FROM reviews
        WHERE hostel_id = $1
        ORDER BY created_at DESC
        LIMIT 5
        `,
        [id]
      );

      const recentReviews = recentReviewsResults.rows[0]
  
      res.json({
        average_rating: parseFloat(summary.average_rating) || 0,
        total_reviews: parseInt(summary.total_reviews) || 0,
        rating_breakdown: ratingBreakdown,
        recent_reviews: recentReviews,
      });
    } catch (error) {
      console.error("Error fetching review summary:", error);
      res.status(500).json({ error: "Failed to load review summary" });
    }
  };

  
  
 export  const getReviews = async (req, res) => {
    const { id } = req.params;
    const { filter, sort, page = 1, limit = 10 } = req.query;
  
    try {
      let query = `
        SELECT id, user_id, rating, comment, created_at
        FROM reviews
        WHERE hostel_id = $1
      `;
      const queryParams = [id];
  
      // Apply rating filter
      if (filter && filter !== "all") {
        query += ` AND rating = $${queryParams.length + 1}`;
        queryParams.push(parseInt(filter));
      }
  
      // Apply sorting
      switch (sort) {
        case "newest":
          query += " ORDER BY created_at DESC";
          break;
        case "oldest":
          query += " ORDER BY created_at ASC";
          break;
        case "highest":
          query += " ORDER BY rating DESC";
          break;
        case "lowest":
          query += " ORDER BY rating ASC";
          break;
        default:
          query += " ORDER BY created_at DESC";
      }
  
      // Apply pagination
      query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(parseInt(limit), (page - 1) * limit);
  
      const reviews = await pool.query(query, queryParams);
  
      // Check if there are more reviews
      const totalCountQuery = `
        SELECT COUNT(*)
        FROM reviews
        WHERE hostel_id = $1
      `;
      const totalCount = await pool.query(totalCountQuery, [id]);
      const hasMore = parseInt(totalCount.rows[0].count) > page * limit;
  
      res.json({
        reviews: reviews.rows,
        has_more: hasMore,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to load reviews" });
    }
  };
