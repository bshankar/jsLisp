(defmacro backwards (body)
  (cons begin
        (reverse body)))

(backwards
 (define n 'forwards)
 (display n)
 (define n 'backwards))
